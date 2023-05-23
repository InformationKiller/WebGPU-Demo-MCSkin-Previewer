window.onload = async function() {
    // HTML
    let fps = document.querySelector('#fps');
    let steveBtn = document.querySelector('#model_steve');
    let alexBtn = document.querySelector('#model_alex');
    let skin = document.querySelector('#skin');

    if (!navigator.gpu) {
        fps.innerText = '当前浏览器不支持WebGPU。';
        return;
    }

    // Init WebGPU
    fps.innerText = '正在初始化WebGPU……';
    await Web3D.init();

    // Canvas
    let canvas = document.querySelector('#render');

    canvas.getContext('webgpu').configure({
        device: Web3D.getDevice(),
        format: navigator.gpu.getPreferredCanvasFormat(),
        alphaMode: 'opaque'
    });

    // Render Pass
    let bitbltPass = Web3D.RenderTarget.fromCanvas(canvas);
    let gbufferPass = new Web3D.RenderTarget(canvas.width * 2, canvas.height * 2);
    let shadowPass = new Web3D.RenderTarget(2048, 2048);

    gbufferPass.createColorAttachment('albedo', Web3D.Texture.Format.RGBA16F);
    gbufferPass.createColorAttachment('normal', Web3D.Texture.Format.RGBA16F);
    gbufferPass.createColorAttachment('post1', Web3D.Texture.Format.RGBA16F);
    gbufferPass.createColorAttachment('post2', Web3D.Texture.Format.RGBA16F);
    gbufferPass.createColorAttachment('output', Web3D.Texture.Format.RGBA8);
    gbufferPass.createDepthAttachment(Web3D.Texture.Format.DEPTH32F);
    shadowPass.createDepthAttachment(Web3D.Texture.Format.DEPTH32F);

    gbufferPass.attachments['output'].getRead().filter(Web3D.Texture.FilterMode.LINEAR, Web3D.Texture.FilterMode.NEAREST, Web3D.Texture.FilterMode.NEAREST);
    gbufferPass.attachments['output'].getWrite().filter(Web3D.Texture.FilterMode.LINEAR, Web3D.Texture.FilterMode.NEAREST, Web3D.Texture.FilterMode.NEAREST);

    // Vertex Formats
    let modelFormat = new Web3D.VertexFormat(Web3D.VertexFormat.Primitive.TRIANGLE_STRIP);
    let groundFormat = new Web3D.VertexFormat(Web3D.VertexFormat.Primitive.TRIANGLE_STRIP);
    let screenFormat = new Web3D.VertexFormat(Web3D.VertexFormat.Primitive.TRIANGLE_STRIP);

    modelFormat.indexFormat = Web3D.VertexFormat.IndexFormat.UINT16;
    modelFormat.addAttribute('vertex', 0, 0, Web3D.VertexFormat.Format.FLOAT32, 3);
    modelFormat.addAttribute('uv', 1, 0, Web3D.VertexFormat.Format.FLOAT32, 2);
    modelFormat.addAttribute('normal', 2, 0, Web3D.VertexFormat.Format.INT8_NORM, 4);
    groundFormat.addAttribute('vertex', 0, 0, Web3D.VertexFormat.Format.FLOAT32, 3);
    screenFormat.addAttribute('vertex', 0, 0, Web3D.VertexFormat.Format.INT8_NORM, 4);

    // Vertex Buffers
    fps.innerText = '正在加载模型文件……';
    let alexModel = null;
    let steveModel = null;
    let groundModel = new Web3D.VertexBuffer();
    let screenModel = new Web3D.VertexBuffer();

    await Promise.all([
        fetch('./models/alex.geo.json').then(resp => resp.json()).then(json => {alexModel = BedrockModel.parseModel(json)}),
        fetch('./models/steve.geo.json').then(resp => resp.json()).then(json => {steveModel = BedrockModel.parseModel(json)})
    ]);

    for (let part in alexModel) {
        let vbo = new Web3D.VertexBuffer();

        vbo.addVertexBuffer(alexModel[part].vertices);
        vbo.addVertexBuffer(alexModel[part].uvs);
        vbo.addVertexBuffer(alexModel[part].normals);
        vbo.setIndexBuffer(alexModel[part].indices);

        alexModel[part].vbo = vbo;
    }

    for (let part in steveModel) {
        let vbo = new Web3D.VertexBuffer();

        vbo.addVertexBuffer(steveModel[part].vertices);
        vbo.addVertexBuffer(steveModel[part].uvs);
        vbo.addVertexBuffer(steveModel[part].normals);
        vbo.setIndexBuffer(steveModel[part].indices);

        steveModel[part].vbo = vbo;
    }

    groundModel.addVertexBuffer(new Float32Array([
        -8, 0, 8,
        8, 0, 8,
        -8, 0, -8,
        8, 0, -8
    ]));

    screenModel.addVertexBuffer(new Int8Array([-128, -128, 0, 0, 127, -128, 0, 0, -128, 127, 0, 0, 127, 127, 0, 0]));

    // Textures
    let alexTex = new Web3D.Texture();
    let steveTex = new Web3D.Texture();
    let customTex = null;
    let groundTex = new Web3D.Texture();

    fps.innerText = '正在加载纹理文件……';
    await Promise.all([
        fetch('./images/alex.png').then(resp => resp.blob()).then(blob => createImageBitmap(blob)).then(bitmap => alexTex.fromBitmap(bitmap)),
        fetch('./images/steve.png').then(resp => resp.blob()).then(blob => createImageBitmap(blob)).then(bitmap => steveTex.fromBitmap(bitmap)),
        fetch('./images/ground.png').then(resp => resp.blob()).then(blob => createImageBitmap(blob)).then(bitmap => groundTex.fromBitmap(bitmap))
    ]);

    // Transform
    let modelView = new Web3D.MatrixStack();
    let projection = new Web3D.MatrixStack();

    let selected = steveModel;
    let modelTransform = {
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
        scale: [0.0625, 0.0625, 0.0625],
        children: {
            RightArm: {
                translate: [0, 0, 0],
                rotate: [0, 0, 0],
                scale: [1, 1, 1]
            },
            LeftArm: {
                translate: [0, 0, 0],
                rotate: [0, 0, 0],
                scale: [1, 1, 1]
            },
            RightLeg: {
                translate: [0, 0, 0],
                rotate: [0, 0, 0],
                scale: [1, 1, 1]
            },
            LeftLeg: {
                translate: [0, 0, 0],
                rotate: [0, 0, 0],
                scale: [1, 1, 1]
            },
        }
    }

    let applyTransform = function(part) {
        let transform = modelTransform;

        if (part != 'root') {
            modelView.translate(selected[part].origin[0], selected[part].origin[1], selected[part].origin[2]);
            transform = modelTransform.children[part];
        }

        if (transform) {
            modelView.translate(transform.translate[0], transform.translate[1], transform.translate[2]);
            modelView.rotate(transform.rotate[2], 0, 0, 1);
            modelView.rotate(transform.rotate[1], 0, 1, 0);
            modelView.rotate(transform.rotate[0], 1, 0, 0);
            modelView.scale(transform.scale[0], transform.scale[1], transform.scale[2]);
        }
    }

    let gbufferCam = {
        lookAt: [0, 1.5, 0],
        distance: 5,
        pitch: 0,
        yaw: 0,
        roll: 0,
        fov: 45,
        near: 0.05,
        far: 20
    };

    let shadowCam = {
        lookAt: [0, 1, 0],
        halfPlane: 1.5,
        distance: 2,
        pitch: -45,
        yaw: -45,
        roll: 0,
        length: 3.5
    };

    let applyGbufferCamera = function() {
        projection.perspective(gbufferCam.fov, canvas.width / canvas.height, gbufferCam.near, gbufferCam.far);
        modelView.translate(0, 0, -(gbufferCam.near + gbufferCam.distance));
        modelView.rotate(gbufferCam.roll, 0, 0, 1);
        modelView.rotate(-gbufferCam.pitch, 1, 0, 0);
        modelView.rotate(gbufferCam.yaw, 0, 1, 0);
        modelView.translate(-gbufferCam.lookAt[0], -gbufferCam.lookAt[1], -gbufferCam.lookAt[2]);
    }

    let applyShadowCamera = function() {
        projection.ortho(-shadowCam.halfPlane, shadowCam.halfPlane, -shadowCam.halfPlane, shadowCam.halfPlane, -shadowCam.length, shadowCam.length);
        modelView.translate(0, 0, -shadowCam.distance);
        modelView.rotate(shadowCam.roll, 0, 0, 1);
        modelView.rotate(-shadowCam.pitch, 1, 0, 0);
        modelView.rotate(shadowCam.yaw, 0, 1, 0);
        modelView.translate(-shadowCam.lookAt[0], -shadowCam.lookAt[1], -shadowCam.lookAt[2]);
    }

    // Uniforms
    let uniformModelView = new Web3D.UniformBuffer(modelView);
    let uniformProjection = new Web3D.UniformBuffer(projection);
    let uniformGbufferModelView = new Web3D.UniformBuffer(modelView);
    let uniformGbufferModelViewInv = new Web3D.UniformBuffer(modelView);
    let uniformGbufferProjection = new Web3D.UniformBuffer(projection);
    let uniformGbufferProjectionInv = new Web3D.UniformBuffer(projection);
    let uniformShadowModelView = new Web3D.UniformBuffer(modelView);
    let uniformShadowModelViewInv = new Web3D.UniformBuffer(modelView);
    let uniformShadowProjection = new Web3D.UniformBuffer(projection);
    let uniformShadowProjectionInv = new Web3D.UniformBuffer(projection);

    // Pipelines
    fps.innerText = '正在加载着色器……';
    let gbufferModelPipeline = null;
    let gbufferGroundPipeline = null;
    let shadowModelPipeline = null;
    let lightingPipeline = null;
    let acesPipeline = null;
    let bitbltPipeline = null;

    await Promise.all([
        new Web3D.PipelineBuilder(gbufferPass, modelFormat, 'model').build().then(pipeline => {gbufferModelPipeline = pipeline}),
        new Web3D.PipelineBuilder(gbufferPass, groundFormat, 'ground').cullMode(Web3D.PipelineBuilder.CullMode.BACK).build().then(pipeline => {gbufferGroundPipeline = pipeline}),
        new Web3D.PipelineBuilder(shadowPass, modelFormat, 'shadow').build().then(pipeline => {shadowModelPipeline = pipeline}),
        new Web3D.PipelineBuilder(gbufferPass, screenFormat, 'lighting').depth(false).build().then(pipeline => {lightingPipeline = pipeline}),
        new Web3D.PipelineBuilder(gbufferPass, screenFormat, 'aces').depth(false).build().then(pipeline => {acesPipeline = pipeline}),
        new Web3D.PipelineBuilder(bitbltPass, screenFormat, 'bitblt').depth(false).build().then(pipeline => {bitbltPipeline = pipeline})
    ]);

    gbufferModelPipeline.bindUniform('mat_modelview', uniformModelView);
    gbufferModelPipeline.bindUniform('mat_projection', uniformProjection);
    gbufferModelPipeline.bindUniform('tex', steveTex.getTextureView(Web3D.Texture.View.COLOR));
    gbufferModelPipeline.bindUniform('tex_sampler', steveTex.getSampler());
    gbufferGroundPipeline.bindUniform('mat_modelview', uniformModelView);
    gbufferGroundPipeline.bindUniform('mat_projection', uniformProjection);
    gbufferGroundPipeline.bindUniform('tex', groundTex.getTextureView(Web3D.Texture.View.COLOR));
    gbufferGroundPipeline.bindUniform('tex_sampler', groundTex.getSampler());

    shadowModelPipeline.bindUniform('mat_modelview', uniformModelView);
    shadowModelPipeline.bindUniform('mat_projection', uniformProjection);
    shadowModelPipeline.bindUniform('tex', steveTex.getTextureView(Web3D.Texture.View.COLOR));
    shadowModelPipeline.bindUniform('tex_sampler', steveTex.getSampler());

    lightingPipeline.bindUniform('mat_gbuffer_modelview', uniformGbufferModelView);
    lightingPipeline.bindUniform('mat_gbuffer_modelview_inv', uniformGbufferModelViewInv);
    lightingPipeline.bindUniform('mat_gbuffer_projection_inv', uniformGbufferProjectionInv);
    lightingPipeline.bindUniform('mat_shadow_modelview', uniformShadowModelView);
    lightingPipeline.bindUniform('mat_shadow_projection', uniformShadowProjection);
    lightingPipeline.bindUniform('mat_shadow_projection_inv', uniformShadowProjectionInv);
    lightingPipeline.bindUniform('depthtex', gbufferPass.depth.getTextureView(Web3D.Texture.View.DEPTH));
    lightingPipeline.bindUniform('depthtex_sampler', gbufferPass.depth.getSampler());
    lightingPipeline.bindUniform('shadowtex', shadowPass.depth.getTextureView(Web3D.Texture.View.DEPTH));
    lightingPipeline.bindUniform('shadowtex_sampler', shadowPass.depth.getSampler());

    // Render
    fps.innerText = '即将启动渲染……';
    let beginTime = new Date().getTime();
    let last = beginTime;
    let frames = 0;

    let render = function() {
        frames += 1;
        let current = new Date().getTime();
        if ((current - last) > 1000) {
            fps.innerText = Math.floor(frames * 1000.0 / (current - last)) + " FPS";
            frames = 0;
            last = current;
        }

        let anim = (current - beginTime) * 0.005;

        modelTransform.rotate[1] = anim * 5.0 % 360.0;
        modelTransform.children.LeftArm.rotate[0] = Math.sin(anim) * 30.0;
        modelTransform.children.RightArm.rotate[0] = Math.sin(anim) * -30.0;
        modelTransform.children.LeftLeg.rotate[0] = Math.sin(anim) * -30.0;
        modelTransform.children.RightLeg.rotate[0] = Math.sin(anim) * 30.0;

        // Shadow Pass
        projection.identity();
        modelView.identity();

        // Setup Camera
        applyShadowCamera();
        uniformShadowProjection.update();
        uniformShadowModelView.update();
        projection.push();
        projection.inverse();
        modelView.push();
        modelView.inverse();
        uniformShadowProjectionInv.update();
        uniformShadowModelViewInv.update();
        projection.pop();
        modelView.pop();
        uniformProjection.update();

        shadowPass.clearDepth(1.0);

        // Render Model 
        modelView.push();
        applyTransform('root');
        for (let i in selected) {
            modelView.push();
            applyTransform(i);
            uniformModelView.update();
            shadowModelPipeline.bindVertexBuffer(selected[i].vbo);
            shadowPass.render(shadowModelPipeline, selected[i].count);
            modelView.pop();
        }
        modelView.pop();

        // Gbuffer Pass
        projection.identity();
        modelView.identity();

        // Setup Camera
        applyGbufferCamera();
        uniformGbufferProjection.update();
        uniformGbufferModelView.update();
        projection.push();
        projection.inverse();
        modelView.push();
        modelView.inverse();
        uniformGbufferProjectionInv.update();
        uniformGbufferModelViewInv.update();
        projection.pop();
        modelView.pop();
        uniformProjection.update();

        gbufferPass.clear(['albedo', 'normal'], 0.0, 0.0, 0.0, 0.0);
        gbufferPass.clearDepth(1.0);

        // Render Model
        modelView.push();
        applyTransform('root');
        for (let i in selected) {
            modelView.push();
            applyTransform(i);
            uniformModelView.update();
            gbufferModelPipeline.bindVertexBuffer(selected[i].vbo);
            gbufferPass.render(gbufferModelPipeline, selected[i].count);
            modelView.pop();
        }
        modelView.pop();

        // Render Ground
        uniformModelView.update();
        gbufferGroundPipeline.bindVertexBuffer(groundModel);
        gbufferPass.render(gbufferGroundPipeline, 4);

        gbufferPass.flip();

        // Post Processing

        // Lighting
        lightingPipeline.bindUniform('albedo', gbufferPass.attachments['albedo'].getRead().getTextureView(Web3D.Texture.View.COLOR));
        lightingPipeline.bindUniform('albedo_sampler', gbufferPass.attachments['albedo'].getRead().getSampler());
        lightingPipeline.bindUniform('normal', gbufferPass.attachments['normal'].getRead().getTextureView(Web3D.Texture.View.COLOR));
        lightingPipeline.bindUniform('normal_sampler', gbufferPass.attachments['normal'].getRead().getSampler());
        lightingPipeline.bindVertexBuffer(screenModel);
        gbufferPass.render(lightingPipeline, 4);
        gbufferPass.flip();

        // Tone mapping
        acesPipeline.bindUniform('linear', gbufferPass.attachments['post1'].getRead().getTextureView(Web3D.Texture.View.COLOR));
        acesPipeline.bindUniform('linear_sampler', gbufferPass.attachments['post1'].getRead().getSampler());
        acesPipeline.bindVertexBuffer(screenModel);
        gbufferPass.render(acesPipeline, 4);
        gbufferPass.flip();

        // Bitblt
        bitbltPipeline.bindUniform('tex', gbufferPass.attachments['output'].getRead().getTextureView(Web3D.Texture.View.COLOR));
        bitbltPipeline.bindUniform('tex_sampler', gbufferPass.attachments['output'].getRead().getSampler());
        bitbltPipeline.bindVertexBuffer(screenModel);
        bitbltPass.render(bitbltPipeline, 4);

        Web3D.getDevice().queue.onSubmittedWorkDone().then(() => {
            requestAnimationFrame(render);
        })
    }

    canvas.onmousemove = function(e) {
        if (e.buttons & 1) {
            gbufferCam.yaw += e.movementX;
            gbufferCam.pitch -= e.movementY;
            gbufferCam.yaw %= 360.0;
            gbufferCam.pitch = Math.max(Math.min(gbufferCam.pitch, 90), -90);
        }
        if (e.buttons & 4) {
            gbufferCam.lookAt[1] += 0.01 * e.movementY;
            gbufferCam.lookAt[1] = Math.max(Math.min(gbufferCam.lookAt[1], 1.6), 0.2);
        }
    }

    canvas.onmousewheel = function(e) {
        gbufferCam.fov += e.deltaY * 0.05;
        gbufferCam.fov = Math.max(Math.min(gbufferCam.fov, 120), 20);
    }

    steveBtn.onclick = function() {
        selected = steveModel;

        steveBtn.disabled = true;
        alexBtn.disabled = false;

        if (!customTex) {
            gbufferModelPipeline.bindUniform('tex', steveTex.getTextureView(Web3D.Texture.View.COLOR));
            gbufferModelPipeline.bindUniform('tex_sampler', steveTex.getSampler());
            shadowModelPipeline.bindUniform('tex', steveTex.getTextureView(Web3D.Texture.View.COLOR));
            shadowModelPipeline.bindUniform('tex_sampler', steveTex.getSampler());
        }
    }

    alexBtn.onclick = function() {
        selected = alexModel;

        steveBtn.disabled = false;
        alexBtn.disabled = true;

        if (!customTex) {
            gbufferModelPipeline.bindUniform('tex', alexTex.getTextureView(Web3D.Texture.View.COLOR));
            gbufferModelPipeline.bindUniform('tex_sampler', alexTex.getSampler());
            shadowModelPipeline.bindUniform('tex', alexTex.getTextureView(Web3D.Texture.View.COLOR));
            shadowModelPipeline.bindUniform('tex_sampler', alexTex.getSampler());
        }
    }

    skin.onchange = async function() {
        let bitmap = await createImageBitmap(skin.files[0]);

        if (!customTex) {
            customTex = new Web3D.Texture();
        }

        customTex.fromBitmap(bitmap);
        gbufferModelPipeline.bindUniform('tex', customTex.getTextureView(Web3D.Texture.View.COLOR));
        gbufferModelPipeline.bindUniform('tex_sampler', customTex.getSampler());
        shadowModelPipeline.bindUniform('tex', customTex.getTextureView(Web3D.Texture.View.COLOR));
        shadowModelPipeline.bindUniform('tex_sampler', customTex.getSampler());
    }

    requestAnimationFrame(render);
}