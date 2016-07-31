# Dragify


## What is it?
`dragify` will turn elements in your dom into dragable elements.
It uses the latest css3 properies to perform action to help optimize performance on lage pages with a lot of content.


## Planned functionality / Known 'bugs'

#### Feature
- Support IE
- Allow for both horizontal and vertical placement (now only horizontal is fully supported)

#### Bug
- Allow for children of different sizes to still be placed at the bottom (because the last child then already is selected on mousemove so it won't trigger a position change)
