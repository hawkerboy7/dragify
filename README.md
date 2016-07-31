# Dragify
> Turn your plain DOM elements into drag queens


## What is it?
`dragify` will turn elements in the DOM into dragable elements.
It triggers hardware acceleration by using the css3 `transform` and `will-change`.
This should help to optimize performance when dragging elements with a lot of content on large pages.


## Demo
Will be created soon


## Features

- Easy to set up
- Uses hardware acceleration
- The possibility to provide a [**threshold**][1]
- Only one dependency ([The MiniEventEmitter][2] which does not have any other dependencies)
- The 'to-be-dragged' element provides visual feedback while dragging


## Install
```
npm install dragify --save
```


## Usage
```js
var dragify = new Dragify(containers,options);

```

### `Containers`
`containers` is an array of the parents of the DOM elements you which to `dragify`.

```html

<div class="parent-one">
	<div class="child"></div>
	<div class="child"></div>
	<div class="child"></div>
	<div class="child"></div>
</div>

<div class="parent-two">
	<div class="child"></div>
	<div class="child"></div>
	<div class="child"></div>
	<div class="child"></div>
</div>
```

```js

containers = [
	document.getElementsByClassName("parent-one"),
	document.getElementsByClassName("parent-two")
]

var dragify = new Dragify(containers);
```


### `Options`

#### `Options.threshold`
The threshold option was created to make sure a **click** on a element **doesn't turn into a drag** because the user can't keep it's mouse steady during the click.
Lots of users want to click on an element but instead drag it, even though it's just a little distance.
This threshold option allows you to determin how much a user is allowed to move **before** the actual drag starts.

```js
options = {
	treshhold: {
		x: 20
		y: 20
	}
}

var dragify = new Dragify(containers, options);
```
*The user can now mousedown on an element and move the mouse 20px left right up and down from it's original starting point before the actual drag will start*



### Events
You can listen to the following events

```js
var dragify = new Dragify(containers);

dragify.on('drag', function(){console.log('drag');});
dragify.on('over', function(){console.log('over');});
dragify.on('move', function(){console.log('move');});
dragify.on('drop', function(){console.log('drop');});
dragify.on('cancel', function(){console.log('cancel');});
dragify.on('end', function(){console.log('end');});
```

Event Name | Listener Arguments      | Event Description
-----------|-------------------------|-------------------
`drag`     | `el, source`            | `el` was lifted from `source`
`over`     | `el, container, source` | `el` is over `container`, and originally came from `source`
`move`     | `el, container, source` | `el`, _the visual aid_'s position has changed in `container`. `el` originally came from `source`
`drop`     | `el, target, source`    | `el` was dropped into `target`, and originally came from `source`
`cancel`   | `el, source`            | `el` was dragged but ended up at it's original position in the original `source`
`end`      | `el`                    | Dragging event for `el` ended with either `cancel` or `drop`


## Planned functionality
- Support IE
- Support both horizontal and vertical placement (now only horizontal is fully supported)
- Support removing
- Support placing at the bottom of the parent container when the placed child is smaller than the child that was originally at that position
- Support mobile


## Planned functionality
- Support IE
- Support both horizontal and vertical placement (now only horizontal is fully supported)
- Support removing
- Support placing at the bottom of the parent container when the placed child is smaller than the child that was originally at that position
- Support mobile


## Inspiration
I have used [Dragula][3] and liked its simplicity but I wanted hardware acceleration and a threshold.
The lack of these functionalities in dragula causes some discomfort for my own use cases.
If required I will try to add more of the functionality that Dragula provides, however I do not focus on supporting < IE10.
PR's for supporting < IE10 however I will take into consideration.


[1]: #optionsthreshold
[2]: https://github.com/hawkerboy7/mini-event-emitter
[3]: https://github.com/bevacqua/dragula/
