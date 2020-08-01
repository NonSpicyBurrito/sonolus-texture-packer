'use strict'

const fs = require('fs')
const packer = require('./packer')

const path = process.argv[2]
const interpolation = process.argv[3] === 'true'

packer(
    fs
        .readdirSync(path)
        .filter(filename => filename.endsWith('.png'))
        .map(filename => {
            return { filename, buffer: fs.readFileSync(`${path}/${filename}`) }
        }),
    interpolation,
    (texture, skin) => {
        fs.writeFileSync('texture.png', texture)
        fs.writeFileSync('skin.json', JSON.stringify(skin))
    }
)
