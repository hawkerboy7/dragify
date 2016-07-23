Handler = require './handler'



class Dragify

	constructor: (@containers, settings) ->

		@settings =
			threshold:
				x: settings?.threshold?.x || 0
				y: settings?.threshold?.y || 0

		# Create handler doing all private work
		new Handler this


	on: (event, fn) ->

		# Create events array or use the existing one
		@events[event] or= []

		# Add function listener
		@events[event].push fn

		# Return this instance for chaining
		this



module.exports = Dragify