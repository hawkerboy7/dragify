<p align="center">
	<a target="_blank" href="https://travis-ci.org/hawkerboy7/dragify">
		<img src="https://img.shields.io/travis/hawkerboy7/dragify.svg?branch=master">
	</a>
	<a target="_blank" href="https://david-dm.org/hawkerboy7/dragify#info=devDependencies&amp;view=table">
		<img src="https://img.shields.io/david/hawkerboy7/dragify.svg">
	</a>
	<a target="_blank" href="https://www.codacy.com/app/dunk_king7/dragify/dashboard">
		<img src="https://img.shields.io/codacy/grade/8cd2ff21ecb545d9b378336a26704532.svg">
	</a>
	<a target="_blank" href="https://gitter.im/hawkerboy7/dragify">
		<img src="https://img.shields.io/badge/Gitter-JOIN%20CHAT%20%E2%86%92-1dce73.svg">
	</a>
</p>



# Dragify


## What is it?
`Dragify` will turn elements in the DOM into dragable elements.
It triggers hardware acceleration by using the css3 `transform` and `will-change`.
This should help to optimize performance when dragging elements with a lot of content on large pages.


## Features

- Easy to set up
- Uses hardware acceleration
- The possibility to provide a [**threshold**][1]
- The 'to-be-dragged' element provide a clean visual feedback while dragging and dropping


## Install
```
npm install dragify --save
```


## Usage
```js
// Only containers
var dragify = new Dragify(containers);

// Only options
var dragify = new Dragify(options);

// Both containers and options
var dragify = new Dragify(containers,options);
```


### `Containers`
`containers` is an array of the parents of the DOM elements you wish to `Dragify`.

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
	document.getElementsByClassName("parent-one")[0],
	document.getElementsByClassName("parent-two")[0]
]

var dragify = new Dragify(containers);
```


### `Options`

#### `Options.threshold`
The threshold option was created to make sure a **click** on a element **does not turn into a drag** because the user cannot keep the mouse steady during the click.
Lots of users want to click on an element but instead drag it, even though it is just a little distance.
This threshold option allows you to determine how much a user is allowed to move **before** the actual drag starts.
As long as the drag does not start all events the element is listening for will still be triggered as if the drag attempt has not happened yet.
By default a threshold of `3px` is applied in both directions.

```js
options = {
	threshold: {
		x: 20,
		y: 20
	}
}

var dragify = new Dragify(options);
```
*The user can now mousedown on an element and move the mouse 20px left right up and down from its original starting point before the actual drag will start.*


#### `Options.transition`
While dragging an element that element will be in transition. Its opacity will drop to `0.3`. When the element is dropped the element's opacity will become `1.0` again.
By default this change in opacity will have a transition. However on `drop` the className `dragify--transition` (which enables this transition) will still be shown on the element due to the time it
takes for the transition to finish. If you do not want this class to be added you can disable the transition class by setting this value to `false`.
By default the transition is set to `true`.

```js
options = {
	transition: false
}

var dragify = new Dragify(options);
```
*Now the transitions class will not be added. Ofcourse you can still add the transition properties to the element directly.*


#### `Options.isContainer`
When you initialize `Dragify` you provide containers which contain children to be dragged. However if you have dynamic children and or containers the new elements will not be `Dragified`.
If you provide the `isContainer` options you can define a function which determines if an element is a valid `Dragify` parent.
The first argument `el` in `isContainer` can be used to check the DOM elements up the tree from the click target.
The second argument `ev` can be used to investigate the mousedown event on the target.

```js
options = {
	isContainer: function (el, ev) {
		return el.classList.contains('dragify--container') && ev.ctrlKey;
	}
}

var dragify = new Dragify(options);
```
*Now any element at any point in time will be a valid Dragify container if it contains the class `dragify--container` and crtl is pressed while attempting to drag*


#### `Options.excludes`
Excludes are DOM elements dragify will ignore. By default `excludes` contains `[INPUT, TEXTAREA, LABEL]`.

```js
options = {
	excludes: ["DIV"]
}

var dragify = new Dragify(options);
```
*Now all DIV's will be ignored by Dragify while attempting to drag*


### Events
You can listen to the following events

```js
var dragify = new Dragify(containers,options);

dragify.on('drag', function(){console.log('drag');});
dragify.on('move', function(){console.log('move');});
dragify.on('drop', function(){console.log('drop');});
dragify.on('cancel', function(){console.log('cancel');});
dragify.on('end', function(){console.log('end');});
```

Event Name | Listener Arguments             | Event Description
-----------|--------------------------------|-------------------
`drag`     | `el, source`                   | `el` was lifted from `source`
`move`     | `el, parent, source, replaced` | `el` changed position and now has parent `parent` and originally came from `source`. If defined `replaced` was replaced by `el`.
`drop`     | `el, parent, source`           | `el` was dropped into `parent`, and originally came from `source`
`cancel`   | `el, source`                   | `el` was dragged but ended up at it's original position in the original `source`
`end`      | `el`                           | Dragging event for `el` ended with either `cancel` or `drop`


## Inspiration
I have used [Dragula][2] and liked its simplicity but I wanted hardware acceleration and a threshold.
The lack of these functionalities in dragula causes some discomfort for my own use cases.
If required I will try to add more of the functionality that Dragula provides, however I do not focus on supporting < IE11.
PR's for supporting < IE11 however I will take into consideration.


[1]: #optionsthreshold
[2]: https://github.com/bevacqua/dragula/
