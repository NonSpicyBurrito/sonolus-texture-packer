'use strict'

const PNG = require('pngjs').PNG

module.exports = (files, interpolation, callback) => {
    const sprites = []
    files.forEach(({ filename, buffer }) => {
        new PNG().parse(buffer, (error, image) => {
            sprites.push({
                ids: filename
                    .substring(0, filename.length - 4)
                    .split(',')
                    .map(id => +id),
                image,
                width: image.width + 2,
                height: image.height + 2,
            })

            if (sprites.length === files.length) {
                sprites.sort((a, b) => b.width * b.height - a.width * a.height || b.width - a.width)

                let size = 1
                while (!pack(size, sprites)) {
                    size *= 2
                }

                const texture = new PNG({ width: size, height: size })
                const outputSprites = []

                sprites.forEach(sprite => {
                    const img = sprite.image

                    sprite.ids.forEach(id => {
                        outputSprites.push({
                            id,
                            x: sprite.x + 1,
                            y: sprite.y + 1,
                            w: img.width,
                            h: img.height,
                        })
                    })

                    img.bitblt(texture, 0, 0, img.width, img.height, sprite.x + 1, sprite.y + 1)

                    img.bitblt(texture, 0, 0, 1, img.height, sprite.x, sprite.y + 1)
                    img.bitblt(texture, img.width - 1, 0, 1, img.height, sprite.x + 1 + img.width, sprite.y + 1)

                    img.bitblt(texture, 0, 0, img.width, 1, sprite.x + 1, sprite.y)
                    img.bitblt(texture, 0, img.height - 1, img.width, 1, sprite.x + 1, sprite.y + 1 + img.height)
                })

                callback(PNG.sync.write(texture), { width: size, height: size, interpolation, sprites: outputSprites })
            }
        })
    })
}

function pack(size, sprites) {
    const spaces = [{ x: 0, y: 0, width: size, height: size }]

    for (const sprite of sprites) {
        const spaceIndex = spaces.findIndex(space => space.width >= sprite.width && space.height >= sprite.height)

        if (spaceIndex == -1) {
            return false
        }

        const space = spaces[spaceIndex]

        sprite.x = space.x
        sprite.y = space.y

        spaces.splice(spaceIndex, 1)

        if (space.width > sprite.width) {
            spaces.push({
                x: space.x + sprite.width,
                y: space.y,
                width: space.width - sprite.width,
                height: sprite.height,
            })
        }

        if (space.height > sprite.height) {
            spaces.push({
                x: space.x,
                y: space.y + sprite.height,
                width: space.width,
                height: space.height - sprite.height,
            })
        }
    }

    return true
}
