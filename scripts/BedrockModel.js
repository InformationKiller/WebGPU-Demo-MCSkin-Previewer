!function() {
    var parseModel =  function(json) {
        let geo = json['minecraft:geometry'][0];
        let texWidth = geo.description.texture_width;
        let texHeight = geo.description.texture_height;
        let bones = geo.bones;
        let parts = {};

        for (let bone of bones) {
            let vertices = [];
            let uvs = [];
            let normals = [];
            let indices = [];

            let index = 0;
            let normalList = [
                [0, 127, 0, 0],
                [0, -128, 0, 0],
                [-128, 0, 0, 0],
                [0, 0, 127, 0],
                [127, 0, 0, 0],
                [0, 0, -128, 0],
            ];
            for (let cube of bone.cubes) {
                let begin = [cube.origin[0] - bone.pivot[0], cube.origin[1] - bone.pivot[1], cube.origin[2] - bone.pivot[2]];
                let size = [cube.size[0], cube.size[1], cube.size[2]];

                if (cube.inflate) {
                    begin[0] -= cube.inflate;
                    begin[1] -= cube.inflate;
                    begin[2] -= cube.inflate;
                    size[0] += 2.0 * cube.inflate;
                    size[1] += 2.0 * cube.inflate;
                    size[2] += 2.0 * cube.inflate;
                }

                let points = [
                    [begin[0]          , begin[1]          , begin[2] + size[2]],
                    [begin[0] + size[0], begin[1]          , begin[2] + size[2]],
                    [begin[0] + size[0], begin[1]          , begin[2]],
                    [begin[0]          , begin[1]          , begin[2]],
                    [begin[0]          , begin[1] + size[1], begin[2] + size[2]],
                    [begin[0] + size[0], begin[1] + size[1], begin[2] + size[2]],
                    [begin[0] + size[0], begin[1] + size[1], begin[2]],
                    [begin[0]          , begin[1] + size[1], begin[2]],
                ]
                let us = [
                    (cube.uv[0]) / texWidth,
                    (cube.uv[0] + cube.size[2]) / texWidth,
                    (cube.uv[0] + cube.size[2] + cube.size[0]) / texWidth,
                    (cube.uv[0] + cube.size[2] + cube.size[0] + cube.size[2]) / texWidth,
                    (cube.uv[0] + cube.size[2] + cube.size[0] + cube.size[2] + cube.size[0]) / texWidth,
                    (cube.uv[0] + cube.size[2] + cube.size[0] + cube.size[0]) / texWidth
                ]
                let vs = [
                    (cube.uv[1]) / texHeight,
                    (cube.uv[1] + cube.size[2]) / texHeight,
                    (cube.uv[1] + cube.size[2] + cube.size[1]) / texHeight,
                ]

                // top
                Array.prototype.push.apply(vertices, points[4]);
                uvs.push(us[1], vs[1]);
                Array.prototype.push.apply(normals, normalList[0]);
                Array.prototype.push.apply(vertices, points[5]);
                uvs.push(us[2], vs[1]);
                Array.prototype.push.apply(normals, normalList[0]);
                Array.prototype.push.apply(vertices, points[6]);
                uvs.push(us[2], vs[0]);
                Array.prototype.push.apply(normals, normalList[0]);
                Array.prototype.push.apply(vertices, points[7]);
                uvs.push(us[1], vs[0]);
                Array.prototype.push.apply(normals, normalList[0]);
                indices.push(index, index + 1, index + 3, index + 2, -1);
                index += 4;
                // bottom
                Array.prototype.push.apply(vertices, points[0]);
                uvs.push(us[2], vs[1]);
                Array.prototype.push.apply(normals, normalList[1]);
                Array.prototype.push.apply(vertices, points[1]);
                uvs.push(us[5], vs[1]);
                Array.prototype.push.apply(normals, normalList[1]);
                Array.prototype.push.apply(vertices, points[2]);
                uvs.push(us[5], vs[0]);
                Array.prototype.push.apply(normals, normalList[1]);
                Array.prototype.push.apply(vertices, points[3]);
                uvs.push(us[2], vs[0]);
                Array.prototype.push.apply(normals, normalList[1]);
                indices.push(index, index + 3, index + 1, index + 2, -1);
                index += 4;
                // left
                Array.prototype.push.apply(vertices, points[3]);
                uvs.push(us[0], vs[2]);
                Array.prototype.push.apply(normals, normalList[2]);
                Array.prototype.push.apply(vertices, points[0]);
                uvs.push(us[1], vs[2]);
                Array.prototype.push.apply(normals, normalList[2]);
                Array.prototype.push.apply(vertices, points[4]);
                uvs.push(us[1], vs[1]);
                Array.prototype.push.apply(normals, normalList[2]);
                Array.prototype.push.apply(vertices, points[7]);
                uvs.push(us[0], vs[1]);
                Array.prototype.push.apply(normals, normalList[2]);
                indices.push(index, index + 1, index + 3, index + 2, -1);
                index += 4;
                // front
                Array.prototype.push.apply(vertices, points[0]);
                uvs.push(us[1], vs[2]);
                Array.prototype.push.apply(normals, normalList[3]);
                Array.prototype.push.apply(vertices, points[1]);
                uvs.push(us[2], vs[2]);
                Array.prototype.push.apply(normals, normalList[3]);
                Array.prototype.push.apply(vertices, points[5]);
                uvs.push(us[2], vs[1]);
                Array.prototype.push.apply(normals, normalList[3]);
                Array.prototype.push.apply(vertices, points[4]);
                uvs.push(us[1], vs[1]);
                Array.prototype.push.apply(normals, normalList[3]);
                indices.push(index, index + 1, index + 3, index + 2, -1);
                index += 4;
                // right
                Array.prototype.push.apply(vertices, points[1]);
                uvs.push(us[2], vs[2]);
                Array.prototype.push.apply(normals, normalList[4]);
                Array.prototype.push.apply(vertices, points[2]);
                uvs.push(us[3], vs[2]);
                Array.prototype.push.apply(normals, normalList[4]);
                Array.prototype.push.apply(vertices, points[6]);
                uvs.push(us[3], vs[1]);
                Array.prototype.push.apply(normals, normalList[4]);
                Array.prototype.push.apply(vertices, points[5]);
                uvs.push(us[2], vs[1]);
                Array.prototype.push.apply(normals, normalList[4]);
                indices.push(index, index + 1, index + 3, index + 2, -1);
                index += 4;
                // back
                Array.prototype.push.apply(vertices, points[2]);
                uvs.push(us[3], vs[2]);
                Array.prototype.push.apply(normals, normalList[5]);
                Array.prototype.push.apply(vertices, points[3]);
                uvs.push(us[4], vs[2]);
                Array.prototype.push.apply(normals, normalList[5]);
                Array.prototype.push.apply(vertices, points[7]);
                uvs.push(us[4], vs[1]);
                Array.prototype.push.apply(normals, normalList[5]);
                Array.prototype.push.apply(vertices, points[6]);
                uvs.push(us[3], vs[1]);
                Array.prototype.push.apply(normals, normalList[5]);
                indices.push(index, index + 1, index + 3, index + 2, -1);
                index += 4;
            }

            parts[bone.name] = {
                origin: bone.pivot,
                vertices: new Float32Array(vertices),
                uvs: new Float32Array(uvs),
                normals: new Int8Array(normals),
                indices: new Uint16Array(indices),
                count: indices.length
            }
        }

        return parts;
    }

    window.BedrockModel = {
        parseModel: parseModel
    }
}();