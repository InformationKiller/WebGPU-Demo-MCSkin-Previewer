!function() {
    var TypedArray = Object.getPrototypeOf(Int8Array);
    var device = null;

    var init = async function() {
        if (device) {
            return;
        }

        if (!navigator.gpu) {
            alert('WebGPU not supported.');
            throw Error('WebGPU not supported.');
        }

        const adapter = await navigator.gpu.requestAdapter();

        if (!adapter) {
            throw Error('Couldn\'t request WebGPU adapter.');
        }

        device = await adapter.requestDevice();
    }

    var MatrixStack = function() {
        this.stack = [];
        this.matrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    var getDevice = function() {
        return device;
    }

    MatrixStack.prototype.push = function() {
        this.stack.push(this.matrix);
        this.matrix = new Float32Array(this.matrix);
    }

    MatrixStack.prototype.pop = function() {
        this.matrix = this.stack.pop();
    }

    MatrixStack.prototype.get = function(row, col) {
        return this.matrix[col * 4 + row]; // Column-major order
    }

    MatrixStack.prototype.set = function(row, col, value) {
        this.matrix[col * 4 + row] = value; // Column-major order
    }

    MatrixStack.prototype.identity = function() {
        this.matrix[0] = 1;
        this.matrix[1] = 0;
        this.matrix[2] = 0;
        this.matrix[3] = 0;
        this.matrix[4] = 0;
        this.matrix[5] = 1;
        this.matrix[6] = 0;
        this.matrix[7] = 0;
        this.matrix[8] = 0;
        this.matrix[9] = 0;
        this.matrix[10] = 1;
        this.matrix[11] = 0;
        this.matrix[12] = 0;
        this.matrix[13] = 0;
        this.matrix[14] = 0;
        this.matrix[15] = 1;
    }

    MatrixStack.prototype.mul = function(mat) {
        let m00 = mat[0] * this.matrix[0] + mat[1] * this.matrix[4] + mat[2] * this.matrix[8] + mat[3] * this.matrix[12];
        let m01 = mat[0] * this.matrix[1] + mat[1] * this.matrix[5] + mat[2] * this.matrix[9] + mat[3] * this.matrix[13];
        let m02 = mat[0] * this.matrix[2] + mat[1] * this.matrix[6] + mat[2] * this.matrix[10] + mat[3] * this.matrix[14];
        let m03 = mat[0] * this.matrix[3] + mat[1] * this.matrix[7] + mat[2] * this.matrix[11] + mat[3] * this.matrix[15];
        let m10 = mat[4] * this.matrix[0] + mat[5] * this.matrix[4] + mat[6] * this.matrix[8] + mat[7] * this.matrix[12];
        let m11 = mat[4] * this.matrix[1] + mat[5] * this.matrix[5] + mat[6] * this.matrix[9] + mat[7] * this.matrix[13];
        let m12 = mat[4] * this.matrix[2] + mat[5] * this.matrix[6] + mat[6] * this.matrix[10] + mat[7] * this.matrix[14];
        let m13 = mat[4] * this.matrix[3] + mat[5] * this.matrix[7] + mat[6] * this.matrix[11] + mat[7] * this.matrix[15];
        let m20 = mat[8] * this.matrix[0] + mat[9] * this.matrix[4] + mat[10] * this.matrix[8] + mat[11] * this.matrix[12];
        let m21 = mat[8] * this.matrix[1] + mat[9] * this.matrix[5] + mat[10] * this.matrix[9] + mat[11] * this.matrix[13];
        let m22 = mat[8] * this.matrix[2] + mat[9] * this.matrix[6] + mat[10] * this.matrix[10] + mat[11] * this.matrix[14];
        let m23 = mat[8] * this.matrix[3] + mat[9] * this.matrix[7] + mat[10] * this.matrix[11] + mat[11] * this.matrix[15];
        let m30 = mat[12] * this.matrix[0] + mat[13] * this.matrix[4] + mat[14] * this.matrix[8] + mat[15] * this.matrix[12];
        let m31 = mat[12] * this.matrix[1] + mat[13] * this.matrix[5] + mat[14] * this.matrix[9] + mat[15] * this.matrix[13];
        let m32 = mat[12] * this.matrix[2] + mat[13] * this.matrix[6] + mat[14] * this.matrix[10] + mat[15] * this.matrix[14];
        let m33 = mat[12] * this.matrix[3] + mat[13] * this.matrix[7] + mat[14] * this.matrix[11] + mat[15] * this.matrix[15];

        this.matrix[0] = m00;
        this.matrix[1] = m01;
        this.matrix[2] = m02;
        this.matrix[3] = m03;
        this.matrix[4] = m10;
        this.matrix[5] = m11;
        this.matrix[6] = m12;
        this.matrix[7] = m13;
        this.matrix[8] = m20;
        this.matrix[9] = m21;
        this.matrix[10] = m22;
        this.matrix[11] = m23;
        this.matrix[12] = m30;
        this.matrix[13] = m31;
        this.matrix[14] = m32;
        this.matrix[15] = m33;
    }

    MatrixStack.prototype.transpose = function() {
        let m00 = this.matrix[0];
        let m01 = this.matrix[1];
        let m02 = this.matrix[2];
        let m03 = this.matrix[3];
        let m10 = this.matrix[4];
        let m11 = this.matrix[5];
        let m12 = this.matrix[6];
        let m13 = this.matrix[7];
        let m20 = this.matrix[8];
        let m21 = this.matrix[9];
        let m22 = this.matrix[10];
        let m23 = this.matrix[11];
        let m30 = this.matrix[12];
        let m31 = this.matrix[13];
        let m32 = this.matrix[14];
        let m33 = this.matrix[15];

        this.matrix[0] = m00;
        this.matrix[1] = m01;
        this.matrix[2] = m02;
        this.matrix[3] = m03;
        this.matrix[4] = m10;
        this.matrix[5] = m11;
        this.matrix[6] = m12;
        this.matrix[7] = m13;
        this.matrix[8] = m20;
        this.matrix[9] = m21;
        this.matrix[10] = m22;
        this.matrix[11] = m23;
        this.matrix[12] = m30;
        this.matrix[13] = m31;
        this.matrix[14] = m32;
        this.matrix[15] = m33;
    }

    MatrixStack.prototype.translate = function(x, y, z) {
        this.mul([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
    }

    MatrixStack.prototype.rotate = function(degrees, x, y, z) {
        let radians = Math.PI * degrees / 180.0;
        let len = Math.sqrt(x * x + y * y + z * z);

        x /= len;
        y /= len;
        z /= len;

        let c = Math.cos(radians);
        let s = Math.sin(radians);
        let a = 1 - c;

        this.mul([
            a * x * x + c, a * x * y + s * z, a * z * x - s * y, 0,
            a * x * y - s * z, a * y * y + c, a * y * z + s * x, 0,
            a * x * z + s * y, a * y * z - s * x, a * z * z + c, 0,
            0, 0, 0, 1
        ]);
    }

    MatrixStack.prototype.scale = function(x, y, z) {
        this.mul([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }

    MatrixStack.prototype.perspective = function(fov, aspect, near, far) {
        let radians = fov / 2.0 * Math.PI / 180.0;
        let deltaZ = far - near;
        let s = Math.sin(radians);
        let cot = Math.cos(radians) / s;

        this.mul([
            cot / aspect, 0, 0, 0,
            0, cot, 0, 0,
            0, 0, -(far + near) / deltaZ, -1.0,
            0, 0, -2.0 * near * far / deltaZ, 0
        ]);
    }

    MatrixStack.prototype.ortho = function(left, right, bottom, top, near, far, isGLOrCanvas) {
        this.mul([
            2.0 / (right - left), 0, 0, 0,
            0, 2.0 / (top - bottom), 0, 0,
            0, 0, -2.0 / (far - near), 0,
            (right + left) / (left - right), (top + bottom) / (bottom - top), (far + near) / (near - far), 1
        ]);
    }

    MatrixStack.prototype.inverse = function() {
        let matrix = this.matrix;
        let inverse = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        var doInverse = function(row) {
            if (row >= 4) {
                return;
            }

            if (Math.abs(matrix[row * 4 + row]) < 0.0001) {
                for (let i = row + 1; i < 4; i++) {
                    if (Math.abs(matrix[row * 4 + i]) >= 0.0001) {
                        for (let j = row; j < 4; j++) {
                            matrix[j * 4 + row] += matrix[j * 4 + i];
                        }
                        for (let j = 0; j < 4; j++) {
                            inverse[j * 4 + row] += inverse[j * 4 + i];
                        }
                        break;
                    }
                }

                if (Math.abs(matrix[row * 4 + row]) < 0.0001) {
                    throw Error('Unable to calculate inverse matrix.');
                }
            }

            let val = matrix[row * 4 + row];
            for (let i = row; i < 4; i++) {
                matrix[i * 4 + row] /= val;
            }
            for (let i = 0; i < 4; i++) {
                inverse[i * 4 + row] /= val;
            }
            for (let i = row + 1; i < 4; i++) {
                let val = matrix[row * 4 + i];
                for (let j = row; j < 4; j++) {
                    matrix[j * 4 + i] -= val * matrix[j * 4 + row];
                }
                for (let j = 0; j < 4; j++) {
                    inverse[j * 4 + i] -= val * inverse[j * 4 + row];
                }
            }
            doInverse(row + 1);
            for (let i = row - 1; i >= 0; i--) {
                let val = matrix[row * 4 + i];
                for (let j = row; j < 4; j++) {
                    matrix[j * 4 + i] -= val * matrix[j * 4 + row];
                }
                for (let j = 0; j < 4; j++) {
                    inverse[j * 4 + i] -= val * inverse[j * 4 + row];
                }
            }
        }

        doInverse(0);
        // console.log(this.matrix);
        // console.log(inverse);
        this.matrix.set(inverse);
    }

    MatrixStack.prototype.isEmpty = function() {
        return this.stack.length === 0;
    }

    var Shader = function() {
        this.compiled = false;
    }

    Shader.prototype.load = async function(name) {
        if (this.compiled) {
            return;
        }

        let vsh = await (await fetch('./shaders/' + name + '.wgvs')).text();
        let fsh = await fetch('./shaders/' + name + '.wgfs');

        if (fsh.ok) {
            fsh = await fsh.text();
        } else {
            fsh = null;
        }

        let attributes = [];
        let uniforms = [];
        let varyings = [];
        let attachments = [];
        let vsh_builtin_in = [];
        let vsh_builtin_out = [];
        let fsh_builtin_in = [];
        let fsh_builtin_out = [];

        let readMacro = function(line) {
            let s = line.indexOf(' ');

            let header = line.substring(0, s).trim().substring(1);

            s = line.substring(s).split(':');

            let name = s[0].trim();
            let type = s[1].split(';')[0].trim();

            return {
                header: header,
                name: name,
                type: type
            }
        }

        let parseVsh = function(source) {
            let lines = source.split('\n');
            let src = '';

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                if (line.trimStart().startsWith('#')) {
                    let macro = readMacro(line);

                    if (macro.header === 'uniform') {
                        let id = -1;

                        for (let j = 0; j < uniforms.length; j++) {
                            if (uniforms[j].name === macro.name) {
                                id = j;

                                break;
                            }
                        }

                        if (id == -1) {
                            id = uniforms.length;

                            uniforms.push(macro);
                        }

                        let uniform = 'var';

                        if (!macro.type.startsWith('texture_') && !macro.type.startsWith('sampler')) {
                            uniform += '<uniform>';
                        }

                        line = '@group(0) @binding(' + id + ') ' + uniform + ' ' + macro.name + ':' + macro.type + ';';
                    } else if (macro.header === 'attribute') {
                        attributes.push(macro);
                        line = 'var<private> ' + macro.name + ':' + macro.type + ';';
                    } else if (macro.header === 'builtin') {
                        if (macro.name.startsWith('in_')) {
                            vsh_builtin_in.push(macro);
                        } else if (macro.name.startsWith('out_')) {
                            vsh_builtin_out.push(macro);
                        }
                        line = 'var<private> ' + macro.name + ':' + macro.type + ';';
                    } else if (macro.header === 'varying') { // TODO: @interpolate(flat)
                        varyings.push(macro);
                        line = 'var<private> ' + macro.name + ':' + macro.type + ';';
                    }
                }

                src += line + '\n';
            }

            let struct_in = '';
            let struct_out = '';
            let before_main = '';
            let after_main = '';

            for (let i = 0; i < vsh_builtin_in.length; i++) {
                struct_in += '@builtin(' + vsh_builtin_in[i].name.substring(3) + ') ' + vsh_builtin_in[i].name + ':' + vsh_builtin_in[i].type + ',\n';
                before_main += vsh_builtin_in[i].name + '=in.' + vsh_builtin_in[i].name + ';\n';
            }

            for (let i = 0; i < attributes.length; i++) {
                struct_in += '@location(' + i + ') ' + attributes[i].name + ':' + attributes[i].type + ',\n';
                before_main += attributes[i].name + '=in.' + attributes[i].name + ';\n';
            }

            struct_in = struct_in.substring(0, struct_in.lastIndexOf(','));

            for (let i = 0; i < vsh_builtin_out.length; i++) {
                struct_out += '@builtin(' + vsh_builtin_out[i].name.substring(4) + ') ' + vsh_builtin_out[i].name + ':' + vsh_builtin_out[i].type + ',\n';
                after_main += 'out.' + vsh_builtin_out[i].name + '=' + vsh_builtin_out[i].name + ';\n';
            }

            for (let i = 0; i < varyings.length; i++) {
                struct_out += '@location(' + i + ') ' + varyings[i].name + ':' + varyings[i].type + ',\n';
                after_main += 'out.' + varyings[i].name + '=' + varyings[i].name + ';\n';
            }

            struct_out = struct_out.substring(0, struct_out.lastIndexOf(','));

            src += `
struct VertexIn
{
#struct_in
};

struct VertexOut
{
#struct_out
};

@vertex
fn _vs_main(in : VertexIn) -> VertexOut
{
#before_main
main();

var out : VertexOut;
#after_main
return out;
}`.replace('#struct_in', struct_in).replace('#struct_out', struct_out).replace('#before_main', before_main).replace('#after_main', after_main);

            return src;
        }

        let parseFsh = function(source) {
            let lines = source.split('\n');
            let src = '';

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                if (line.trimStart().startsWith('#')) {
                    let macro = readMacro(line);

                    if (macro.header === 'uniform') {
                        let id = -1;

                        for (let j = 0; j < uniforms.length; j++) {
                            if (uniforms[j].name === macro.name) {
                                id = j;

                                break;
                            }
                        }

                        if (id == -1) {
                            id = uniforms.length;

                            uniforms.push(macro);
                        }

                        let uniform = 'var';

                        if (!macro.type.startsWith('texture_') && !macro.type.startsWith('sampler')) {
                            uniform += '<uniform>';
                        }

                        line = '@group(0) @binding(' + id + ') ' + uniform + ' ' + macro.name + ':' + macro.type + ';';
                    } else if (macro.header === 'attachment') {
                        attachments.push(macro);
                        line = 'var<private> ' + macro.name + ':' + macro.type + ';';
                    } else if (macro.header === 'builtin') {
                        if (macro.name.startsWith('in_')) {
                            fsh_builtin_in.push(macro);
                        } else if (macro.name.startsWith('out_')) {
                            fsh_builtin_out.push(macro);
                        }
                        line = 'var<private> ' + macro.name + ':' + macro.type + ';';
                    } else if (macro.header === 'varying') {
                        line = 'var<private> ' + macro.name + ':' + macro.type + ';';
                    }
                }

                src += line + '\n';
            }

            let struct_in = '';
            let struct_out = '';
            let before_main = '';
            let after_main = '';

            for (let i = 0; i < fsh_builtin_in.length; i++) {
                struct_in += '@builtin(' + fsh_builtin_in[i].name.substring(3) + ') ' + fsh_builtin_in[i].name + ':' + fsh_builtin_in[i].type + ',\n';
                before_main += fsh_builtin_in[i].name + '=in.' + fsh_builtin_in[i].name + ';\n';
            }

            for (let i = 0; i < varyings.length; i++) {
                struct_in += '@location(' + i + ') ' + varyings[i].name + ':' + varyings[i].type + ',\n';
                before_main += varyings[i].name + '=in.' + varyings[i].name + ';\n';
            }

            struct_in = struct_in.substring(0, struct_in.lastIndexOf(','));

            if (struct_in.length == 0) {
                struct_in = '@builtin(position) in_position : vec4f';
            }

            for (let i = 0; i < fsh_builtin_out.length; i++) {
                struct_out += '@builtin(' + fsh_builtin_out[i].name.substring(4) + ') ' + fsh_builtin_out[i].name + ':' + fsh_builtin_out[i].type + ',\n';
                after_main += 'out.' + fsh_builtin_out[i].name + '=' + fsh_builtin_out[i].name + ';\n';
            }

            for (let i = 0; i < attachments.length; i++) {
                struct_out += '@location(' + i + ') ' + attachments[i].name + ':' + attachments[i].type + ',\n';
                after_main += 'out.' + attachments[i].name + '=' + attachments[i].name + ';\n';
            }

            struct_out = struct_out.substring(0, struct_out.lastIndexOf(','));

            if (struct_out.length == 0) {
                struct_out = '@builtin(frag_depth) out_frag_depth : f32';
                
                if (!struct_in.includes('in_position')) {
                    struct_in += ',\n@builtin(position) in_position : vec4f';
                }

                after_main += 'out.out_frag_depth = in.in_position.z;';
            }

            src += `
struct FragmentIn
{
#struct_in
};

struct FragmentOut
{
#struct_out
};

@fragment
fn _fs_main(in : FragmentIn) -> FragmentOut
{
#before_main
main();

var out : FragmentOut;
#after_main
return out;
}`.replace('#struct_in', struct_in).replace('#struct_out', struct_out).replace('#before_main', before_main).replace('#after_main', after_main);

            return src;
        }

        vsh = parseVsh(vsh);

        if (fsh) {
            fsh = parseFsh(fsh);
        }

        // console.log(vsh);
        // console.log(fsh);

        this.vertex = device.createShaderModule({
            code: vsh
        });
        // this.vertex.getCompilationInfo();
        if (fsh) {
            this.fragment = device.createShaderModule({
                code: fsh
            });
        }
        // this.fragment.getCompilationInfo();

        this.attributes = [];
        this.attachments = [];
        this.uniforms = [];

        for (let obj of attributes) {
            this.attributes.push(obj.name);
        }
        for (let obj of attachments) {
            this.attachments.push(obj.name);
        }
        for (let obj of uniforms) {
            this.uniforms.push(obj.name);
        }

        this.compiled = true;
    }

    var UniformBuffer = function(obj) {
        this.buffers = [];
        this.target = obj;
        this.size = -1;
        this.current = -1;

        if (this.target instanceof MatrixStack) {
            this.size = this.target.matrix.byteLength;
        } else if (this.target instanceof ArrayBuffer || this.target instanceof TypedArray || this.target instanceof DataView) {
            this.size = this.target.byteLength;
        } else {
            throw Error('Unsupported type.');
        }
    }

    UniformBuffer.prototype.update = function() {
        let changed = this.current == -1 || this.buffers[this.current].using;

        if (changed) {
            this.current = -1;
            for (let i in this.buffers) {
                if (!this.buffers[i].using) {
                    this.current = i;
                    break;
                }
            }

            if (this.current == -1) {
                this.current = this.buffers.length;
                this.buffers.push({
                    buffer: device.createBuffer({
                        size: this.size,
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                    }),
                    using: false
                });
            }
        }

        if (this.target instanceof MatrixStack) {
            device.queue.writeBuffer(this.buffers[this.current].buffer, 0, this.target.matrix);
        } else {
            device.queue.writeBuffer(this.buffers[this.current].buffer, 0, this.target);
        }
    }

    UniformBuffer.prototype.destroy = function() {
        this.buffer.destroy();
        this.buffer = null;
    }

    var VertexFormat = function(primitive) {
        this.primitive = primitive;
        this.frontFace = 'ccw';
        this.attributes = {};
        this.indexFormat = 'uint16';
        this.usedBuffers = 0;
    }

    VertexFormat.prototype.addAttribute = function(name, index, offset, format, size) {
        let length = formatLength[format] * size;
        if (size > 1) {
            format = format + 'x' + size;
        }

        if (!supportedFormat.includes(format)) {
            throw Error("Unsupported format.");
        }

        this.attributes[name] = {
            index: index,
            offset: offset,
            format: format,
            length: length
        }
        this.usedBuffers = Math.max(this.usedBuffers, index + 1);
    }

    VertexFormat.prototype.removeAttribute = function(name) {
        delete this.attributes[name];
    }

    VertexFormat.Primitive = {
        POINT: 'point-list',
        LINE: 'line-list',
        LINE_STRIP: 'line-strip',
        TRIANGLE: 'triangle-list',
        TRIANGLE_STRIP: 'triangle-strip'
    }

    VertexFormat.FrontFacing = {
        COUNTERCLOCKWISE: 'ccw',
        CLOCKWISE: 'cw'
    }

    var supportedFormat = ['uint8x2', 'uint8x4', 'sint8x2', 'sint8x4', 'unorm8x2', 'unorm8x4', 'snorm8x2', 'snorm8x4', 'uint16x2', 'uint16x4', 'sint16x2', 'sint16x4', 'unorm16x2', 'unorm16x4', 'snorm16x2', 'snorm16x4', 'float16x2', 'float16x4', 'float32', 'float32x2', 'float32x3', 'float32x4', 'uint32', 'uint32x2', 'uint32x3', 'uint32x4', 'sint32', 'sint32x2', 'sint32x3', 'sint32x4'];
    var formatLength = {
        'uint8': 1,
        'sint8': 1,
        'unorm8': 1,
        'snorm8': 1,
        'uint16': 2,
        'sint16': 2,
        'unorm16': 2,
        'snorm16': 2,
        'float16': 2,
        'float32': 4,
        'uint32': 4,
        'sint32': 4
    }

    VertexFormat.Format = {
        UINT8: 'uint8',
        INT8: 'sint8',
        UINT8_NORM: 'unorm8',
        INT8_NORM: 'snorm8',
        UINT16: 'uint16',
        INT16: 'sint16',
        UINT16_NORM: 'unorm16',
        INT16_NORM: 'snorm16',
        FLOAT16: 'float16',
        FLOAT32: 'float32',
        UINT32: 'uint32',
        INT32: 'sint32'
    }

    VertexFormat.IndexFormat = {
        UINT16: 'uint16',
        UINT32: 'uint32'
    }

    var VertexBuffer = function() {
        this.buffers = [];
        this.indices = null;
    }

    VertexBuffer.prototype.addVertexBuffer = function(vertexBuffer) {
        let buffer = device.createBuffer({
            size: vertexBuffer.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        device.queue.writeBuffer(buffer, 0, vertexBuffer);
        this.buffers.push(buffer);
    }

    VertexBuffer.prototype.setIndexBuffer = function(indexBuffer) {
        this.removeIndexBuffer();

        this.indices = device.createBuffer({
            size: indexBuffer.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });

        device.queue.writeBuffer(this.indices, 0, indexBuffer);
    }

    VertexBuffer.prototype.removeIndexBuffer = function() {
        if (this.indices) {
            this.indices.destroy();
            this.indices = null;
        }
    }

    var Texture = function() {
        this.sampler = null;
        this.samplerModified = false;
        this.addressModeU = 'clamp-to-edge';
        this.addressModeV = 'clamp-to-edge';
        this.minFilter = 'nearest';
        this.magFilter = 'nearest';
        this.mipmapFilter = 'nearest';
        this.anisotropy = 1;
        this.texture = null;
    }

    Texture.prototype.create = function(width, height, format, usage) {
        if (this.texture) {
            this.texture.destroy();
        }

        this.texture = device.createTexture({
            size: [width, height, 1],
            format: format,
            usage: usage
        });
    }

    Texture.prototype.fromBitmap = function(bitmap) {
        if (this.texture) {
            this.texture.destroy();
        }

        this.texture = device.createTexture({
            size: [bitmap.width, bitmap.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT // COPY_DST & RENDER_ATTACHMENT is needed.
        });

        device.queue.copyExternalImageToTexture({
            source: bitmap
        }, {
            texture: this.texture
        }, {
            width: bitmap.width,
            height: bitmap.height
        });
    }

    Texture.prototype.getSampler = function() {
        if (!this.sampler || this.samplerModified) {
            this.sampler = device.createSampler({
                addressModeU: this.addressModeU,
                addressModeV: this.addressModeV,
                magFilter: this.magFilter,
                minFilter: this.minFilter,
                mipmapFilter: this.mipmapFilter,
                maxAnisotropy: this.anisotropy
            });

            this.samplerModified = false;
        }

        return this.sampler;
    }

    Texture.prototype.addressMode = function(u, v) {
        this.samplerModified = true;
        this.addressModeU = u;
        this.addressModeV = v;

        return this;
    }

    Texture.prototype.filter = function(min, mag, mipmap) {
        this.samplerModified = true;
        this.minFilter = min;
        this.magFilter = mag;
        this.mipmapFilter = mipmap;

        return this;
    }

    Texture.prototype.maxAnisotropy = function(a) {
        this.samplerModified = true;
        this.anisotropy = a;

        return this;
    }

    Texture.prototype.getTextureView = function(view) {
        return this.texture.createView({
            aspect: view
        });
    }

    Texture.prototype.destroy = function() {
        this.texture.destroy();
        this.texture = null;
    }

    Texture.AddressMode = {
        CLAMP_TO_EDGE: 'clamp-to-edge',
        REPEAT: 'repeat',
        MIRROR: 'mirror-repeat'
    }

    Texture.FilterMode = {
        NEAREST: 'nearest',
        LINEAR: 'linear'
    }

    Texture.Format = {
        R8: 'r8unorm',
        R8SNORM: 'r8snorm',
        R8UI: 'r8uint',
        R8I: 'r8sint',
        R16UI: 'r16uint',
        R16I: 'r16sint',
        R16F: 'r16float',
        RG8: 'rg8unorm',
        RG8SNORM: 'rg8snorm',
        RG8UI: 'rg8uint',
        RG8I: 'rg8sint',
        R32UI: 'r32uint',
        R32I: 'r32sint',
        R32F: 'r32float',
        RG16UI: 'rg16uint',
        RG16I: 'rg16sint',
        RG16F: 'rg16float',
        RGBA8: 'rgba8unorm',
        RGBA8_SRGB: 'rgba8unorm-srgb',
        RGBA8SNORM_SRGB: 'rgba8snorm',
        RGBA8UI: 'rgba8uint',
        RGBA8I: 'rgba8sint',
        BGRA8: 'bgra8unorm',
        BGRA8_SRGB: 'bgra8unorm-srgb',
        RGB9E5F: 'rgb9e5ufloat',
        RGB10_A2: 'rgb10a2unorm',
        R11G11B10F: 'rg11b10ufloat',
        RG32UI: 'rg32uint',
        RG32I: 'rg32sint',
        RG32F: 'rg32float',
        RGBA16UI: 'rgba16uint',
        RGBA16I: 'rgba16sint',
        RGBA16F: 'rgba16float',
        RGBA32UI: 'rgba32uint',
        RGBA32I: 'rgba32sint',
        RGBA32F: 'rgba32float',
        STENCIL8: 'stencil8',
        DEPTH16: 'depth16unorm',
        DEPTH24: 'depth24plus',
        DEPTH24_STENCIL8: 'depth24plus-stencil8',
        DEPTH32F: 'depth32float',
        DEPTH32F_STENCIL8: 'depth32float-stencil8'
    }

    Texture.View = {
        COLOR: 'all',
        DEPTH_AND_STENCIL: 'all',
        DEPTH: 'depth-only',
        STENCIL: 'stencil-only'
    }

    var Attachment = function(width, height, format) {
        this.width = width;
        this.height = height;
        this.format = format;
        this.rendered = false;
        this.flipped = false;

        this.textures = [new Texture(), new Texture()];
        this.textures[0].create(width, height, format, GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT);
        this.textures[1].create(width, height, format, GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT);
    }

    Attachment.prototype.getRead = function() {
        return this.textures[this.flipped + 0];
    }

    Attachment.prototype.getWrite = function() {
        return this.textures[!this.flipped + 0];
    }

    Attachment.prototype.flip = function() {
        this.flipped = !this.flipped;
    }

    Attachment.prototype.resize = function(width, height) {
        if (this.width == width && this.height == height) {
            return;
        }

        this.width = width;
        this.height = height;

        for (let i = 0; i < this.textures.length; i++) {
            this.textures[i].destroy();
            this.textures[i].create(width, height, format, GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT);
        }
    }

    Attachment.prototype.destroy = function() {
        for (let i = 0; i < this.textures.length; i++) {
            this.textures[i].destroy();
        }
    }

    var CanvasAttachment = function(canvas) {
        this.texture = {
            getTextureView: function() {
                return canvas.getContext('webgpu').getCurrentTexture().createView(); // GetCurrentTexture() needs to be called again every time rendering to canvas
            }
        };
        this.format = canvas.getContext('webgpu').getCurrentTexture().format;
    }

    CanvasAttachment.prototype.getWrite = function() {
        return this.texture;
    }

    CanvasAttachment.prototype.flip = function() {}

    var RenderTarget = function(width, height) {
        this.width = width;
        this.height = height;
        this.attachments = {};
        this.depth = null;
        this.depthFormat = null;
    }

    RenderTarget.prototype.createColorAttachment = function(name, format) {
        if (name in this.attachments) {
            this.attachments[name].destroy();
        }

        this.attachments[name] = new Attachment(this.width, this.height, format);
    }

    RenderTarget.prototype.removeColorAttachment = function(name) {
        if (name in this.attachments) {
            this.attachments[name].destroy();
            delete this.attachments[name];
        }
    }

    RenderTarget.prototype.createDepthAttachment = function(format) {
        this.depth = new Texture();
        this.depth.create(this.width, this.height, format, GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT);
        this.depthFormat = format;
    }

    RenderTarget.prototype.removeDepthAttachment = function() {
        this.depth.destroy();
        this.depth = null;
    }

    RenderTarget.prototype.flip = function() {
        for (let i in this.attachments) {
            if (this.attachments[i].rendered) {
                this.attachments[i].flip();
                this.attachments[i].rendered = false;
            }
        }
    }

    RenderTarget.prototype.render = function(pipeline, count, offset) {
        let renderPass = {
            colorAttachments: []
        };

        for (let i of pipeline.attachments) {
            if (this.attachments[i] instanceof Attachment) {
                renderPass.colorAttachments.push({
                    loadOp: 'load',
                    storeOp: 'store',
                    view: this.attachments[i].getWrite().getTextureView(Texture.View.COLOR)
                });
                this.attachments[i].rendered = true;
            } else {
                renderPass.colorAttachments.push({
                    clearValue: {r: 0, g: 0, b: 0, a: 0},
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: this.attachments[i].getWrite().getTextureView(Texture.View.COLOR)
                });
            }
        }

        if (pipeline.depthEnabled && this.depth) {
            renderPass.depthStencilAttachment = {
                depthLoadOp: 'load',
                depthStoreOp: 'store',
                view: this.depth.getTextureView(Texture.View.DEPTH_AND_STENCIL)
            };
        }

        let commandEncoder = device.createCommandEncoder();
        let passEncoder = commandEncoder.beginRenderPass(renderPass);

        passEncoder.setPipeline(pipeline.pipeline);
        passEncoder.setViewport(pipeline.viewport[0], pipeline.viewport[1], pipeline.viewport[2], pipeline.viewport[3], pipeline.viewport[4], pipeline.viewport[5]);

        let uniformBlock = pipeline.getUniformBlock();
        if (uniformBlock) {
            passEncoder.setBindGroup(0, uniformBlock.bindGroup);
        }

        for (let i in pipeline.vertexBuffer.buffers) {
            passEncoder.setVertexBuffer(i, pipeline.vertexBuffer.buffers[i]);
        }

        if (pipeline.vertexBuffer.indices) {
            passEncoder.setIndexBuffer(pipeline.vertexBuffer.indices, pipeline.indexFormat);
            passEncoder.drawIndexed(count, 1, offset);
        } else {
            passEncoder.draw(count, 1, offset);
        }

        passEncoder.end();

        for (let i of uniformBlock.using) {
            i.using = true;
        }

        device.queue.submit([commandEncoder.finish()]);
        device.queue.onSubmittedWorkDone().then(() => {
            for (let i of uniformBlock.using) {
                i.using = false;
            }
        });
    }

    RenderTarget.prototype.clear = function(attachments, red, green, blue, alpha) {
        let colorAttachments = [];
        for (let i of attachments) {
            if (i in this.attachments) {
                colorAttachments.push({
                    clearValue: {
                        r: red,
                        g: green,
                        b: blue,
                        a: alpha
                    },
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: this.attachments[i].getWrite().getTextureView(Texture.View.COLOR)
                });
            }
        }

        let commandEncoder = device.createCommandEncoder();
        let passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: colorAttachments
        });
        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
    }

    RenderTarget.prototype.clearDepth = function(depth) {
        if (this.depth) {
            let commandEncoder = device.createCommandEncoder();
            let passEncoder = commandEncoder.beginRenderPass({
                colorAttachments: [],
                depthStencilAttachment: {
                    depthClearValue: depth,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store',
                    view: this.depth.getTextureView(Texture.View.DEPTH)
                }
            });
            passEncoder.end();
            device.queue.submit([commandEncoder.finish()]);
        }
    }

    RenderTarget.prototype.clearStencil = function(stencil) {
        // TODO
    }

    RenderTarget.prototype.resize = function(width, height) {
        if (this.width === width && this.height === height) {
            return;
        }

        this.width = width;
        this.height = height;

        for (let i in this.attachments) {
            this.attachments[i].resize(width, height);
        }

        if (this.depth) {
            this.depth.destroy();
            this.depth.create(this.width, this.height, format, GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT);
        }
    }

    RenderTarget.prototype.destroy = function() {
        for (let i in this.attachments) {
            this.attachments[i].destroy();
        }

        this.attachments = {};

        if (this.depth) {
            this.depth.destroy();
            this.depth = null;
        }
    }

    RenderTarget.fromCanvas = function(canvas) {
        let rt = new RenderTarget(canvas.width, canvas.height);

        rt.attachments['canvas'] = new CanvasAttachment(canvas);
        return rt;
    }

    var shaders = {};
    var getShader = async function(name) {
        if (!(name in shaders)) {
            let shader = new Shader();
            await shader.load(name);
            shaders[name] = shader;
        }

        return shaders[name];
    }

    var PipelineBuilder = function(renderTarget, vertexFormat, shaderName) {
        this.renderTarget = renderTarget;
        this.vertexFormat = vertexFormat;
        this.shader = shaderName;

        this.culling = 'none';
        this.depthEnabled = true;
        this.depthWrite = true;
        this.depthCompare = 'less-equal';
        this.config = {};
    }

    PipelineBuilder.prototype.cullMode = function(mode) {
        this.culling = mode;

        return this;
    }

    PipelineBuilder.prototype.depth = function(enabled) {
        this.depthEnabled = enabled;

        return this;
    }

    PipelineBuilder.prototype.depthTest = function(test) {
        this.depthCompare = test;

        return this;
    }

    PipelineBuilder.prototype.depthMask = function(value) {
        this.depthWrite = value;

        return this;
    }

    PipelineBuilder.prototype.blendFunc = function(name, colorOp, colorSrcFactor, colorDstFactor, alphaOp, alphaSrcFactor, alphaDstFactor) {
        this.config[name].blend = {
            color: {
                operation: colorOp,
                srcFactor: colorSrcFactor,
                dstFactor: colorDstFactor
            },
            alpha: {
                operation: alphaOp,
                srcFactor: alphaSrcFactor,
                dstFactor: alphaDstFactor
            }
        }

        return this;
    }

    PipelineBuilder.prototype.colorMask = function(name, red, green, blue, alpha) {
        this.config[name].writeMask = red << 0 | green << 1 | blue << 2 | alpha << 3;

        return this;
    }

    PipelineBuilder.prototype.build = async function() {
        let shader = await getShader(this.shader);
        let descriptor = {
            layout: 'auto',
            primitive: {
                topology: this.vertexFormat.primitive,
                stripIndexFormat: this.vertexFormat.indexFormat,
                frontFace: this.vertexFormat.frontFace,
                cullMode: this.culling
            },
            vertex: {
                module: shader.vertex,
                entryPoint: '_vs_main'
            }
        };

        let buffers = [];
        let stride = [];

        for (let i = 0; i < this.vertexFormat.usedBuffers; i++) {
            buffers.push({stepMode: 'vertex', attributes: []});
            stride.push(0);
        }

        for (let name in this.vertexFormat.attributes) {
            let attribute = this.vertexFormat.attributes[name];
            stride[attribute.index] += attribute.length;
            if (shader.attributes.includes(name)) {
                buffers[attribute.index].attributes.push({
                    shaderLocation: shader.attributes.indexOf(name),
                    offset: attribute.offset,
                    format: attribute.format
                });
            }
        }

        for (let i = 0; i < buffers.length; i++) {
            buffers[i].arrayStride = stride[i];
        }

        descriptor.vertex.buffers = buffers;

        if (shader.fragment) {
            descriptor.fragment = {
                module: shader.fragment,
                entryPoint: '_fs_main',
                targets: []
            };

            for (let name of shader.attachments) {
                let target = {
                    format: this.renderTarget.attachments[name].format
                };

                if (name in this.config) {
                    for (let prop in this.config[name]) {
                        target[prop] = this.config[name][prop];
                    }
                }

                descriptor.fragment.targets.push(target);
            }
        }

        if (this.depthEnabled && this.renderTarget.depth) {
            descriptor.depthStencil = {
                format: this.renderTarget.depthFormat,
                depthWriteEnabled: this.depthWrite,
                depthCompare: this.depthCompare
            };
        }

        // console.log(descriptor);
        return new Pipeline(device.createRenderPipeline(descriptor), shader, this.vertexFormat.indexFormat, this.depthEnabled, [0, 0, this.renderTarget.width, this.renderTarget.height, 0.0, 1.0]);
    }

    PipelineBuilder.CullMode = {
        NONE: 'none',
        FRONT: 'front',
        BACK: 'back'
    }

    PipelineBuilder.DepthTest = {
        NEVER: 'never',
        LESS: 'less',
        EQUAL: 'equal',
        LESS_EQUAL: 'less-equal',
        GREATER: 'greater',
        NOT_EQUAL: 'not-equal',
        GREATER_EQUAL: 'greater-equal',
        ALWAYS: 'always'
    }

    PipelineBuilder.BlendOp = {
        ADD: 'add',
        SUB: 'subtract',
        SUB_REVERSE: 'reverse-subtract',
        MIN: 'min',
        MAX: 'max'
    }

    PipelineBuilder.BlendFactor = {
        ZERO: 'zero',
        ONE: 'one',
        SRC: 'src',
        ONE_MINUS_SRC: 'one-minus-src',
        SRC_ALPHA: 'src-alpha',
        ONE_MINUS_SRC_ALPHA: 'one-minus-src-alpha',
        DST: 'dst',
        ONE_MINUS_DST: 'one-minus-dst',
        DST_ALPHA: 'dst-alpha',
        ONE_MINUS_DST_ALPHA: 'one-minus-dst-alpha',
        SRC_ALPHA_SATURATED: 'src-alpha-saturated',
        CONSTANT: 'constant',
        ONE_MINUS_CONSTANT: 'one-minus-constant'
    }

    var Pipeline = function(pipeline, shader, indexFormat, depthEnabled, viewport) {
        this.pipeline = pipeline;
        this.attachments = shader.attachments;
        this.uniformLayout = shader.uniforms;
        this.bindGroupLayout = pipeline.getBindGroupLayout(0);
        this.indexFormat = indexFormat;
        this.depthEnabled = depthEnabled;
        this.defaultViewport = viewport;

        this.viewport = [viewport[0], viewport[1], viewport[2], viewport[3], viewport[4], viewport[5]];
        this.vertexBuffer = null;
        this.uniforms = {};
        this.hasUniform = false;
        this.bindGroup = null;
        this.lastBuffers = {};
    }

    Pipeline.prototype.setViewport = function(x, y, width, height, minDepth, maxDepth) {
        this.viewport[0] = x;
        this.viewport[1] = y;
        this.viewport[2] = width;
        this.viewport[3] = height;

        if (arguments.length > 4) {
            this.viewport[4] = minDepth;
            this.viewport[5] = maxDepth;
        }
    }

    Pipeline.prototype.bindVertexBuffer = function(vertexBuffer) {
        this.vertexBuffer = vertexBuffer;
    }

    Pipeline.prototype.bindUniform = function(uniform, value) {
        if (this.uniformLayout.includes(uniform)) {
            this.uniforms[uniform] = value;
            this.hasUniform = true;
            this.bindGroup = null;
        }
    }

    Pipeline.prototype.getUniformBlock = function() {
        if (this.hasUniform) {
            if (this.bindGroup) {
                for (let i in this.uniforms) {
                    if (this.uniforms[i] instanceof UniformBuffer) {
                        if (this.lastBuffers[i] != this.uniforms[i].current) {
                            this.bindGroup = null;
                            break;
                        }
                    }
                }
            }

            if (!this.bindGroup) {
                let entries = [];
                for (let i in this.uniforms) {
                    if (this.uniforms[i] instanceof UniformBuffer) {
                        entries.push({
                            binding: this.uniformLayout.indexOf(i),
                            resource: this.uniforms[i].buffers[this.uniforms[i].current]
                        });
                        this.lastBuffers[i] = this.uniforms[i].current;
                    } else {
                        entries.push({
                            binding: this.uniformLayout.indexOf(i),
                            resource: this.uniforms[i]
                        });
                    }
                }
                this.bindGroup = device.createBindGroup({
                    layout: this.bindGroupLayout,
                    entries: entries
                });
            }

            let using = [];
            for (let i in this.uniforms) {
                if (this.uniforms[i] instanceof UniformBuffer) {
                    using.push(this.uniforms[i].buffers[this.uniforms[i].current]);
                }
            }

            return {
                bindGroup: this.bindGroup,
                using: using
            }
        } else {
            return null;
        }
    }

    Pipeline.prototype.resetBinding = function() {
        this.viewport = [this.defaultViewport[0], this.defaultViewport[1], this.defaultViewport[2], this.defaultViewport[3], this.defaultViewport[4], this.defaultViewport[5]];
        this.vertexBuffer = null;
        this.uniforms = {};
        this.hasUniform = false;
        this.bindGroup = null;
    }

    window.Web3D = {
        init: init,
        getDevice: getDevice,
        MatrixStack: MatrixStack,
        UniformBuffer: UniformBuffer,
        VertexFormat: VertexFormat,
        VertexBuffer: VertexBuffer,
        Texture: Texture,
        Attachment: Attachment,
        RenderTarget: RenderTarget,
        PipelineBuilder: PipelineBuilder
    };
}();