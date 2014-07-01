

	var   Class 		= require( "ee-class" )
		, log 			= require( "ee-log" )
		, moment 		= require( "moment" )
		, type 			= require( "ee-types" );



	var Transformer = new Class( {


		transform: function( json, rules ){
			var root = json[ Object.keys( json )[ 0 ] ];

			return this._transform( root, rules );
		}



		, _transform: function( node, rules ){
			var result = {};

			Object.keys( rules ).forEach( function( key ){
				var rule = rules[ key ];

				// shorthand string rule
				if ( type.string( rule ) ){
					result[ rule ] = this.transformChild( node[ key ], { type: "string", name: rule  } );
				}
				else if ( type.object( rule ) ){
					result[ rule.name ] = this.transformChild( node[ key ], rule );
				}
				else {
					// this is fuckin invalid!
					throw new Error( "The rule «"+key+"» is typeof «"+type(rule)+"». Allowed are types «object» and «string»!" ).setName( "InvalidRuleException" );
				}
			}.bind( this ) );

			return result;
		}



		, transformChild: function( node, rule ){
			if ( type.undefined( node ) ) return undefined;
			else {
				switch ( rule.type.toLowerCase().trim() ){
					case "string":
					case "s":
						return this.getStringFromNode( node, rule );
						break;

					case "number":
					case "n":
						return this.getNumberFromNode( node, rule );
						break;

					case "boolean":
					case "bool":
					case "b":
						return this.getBooleanFromNode( node, rule );
						break;

					case "date":
					case "d":
						return this.getDateFromNode( node, rule );
						break;

					case "array":
					case "a":
						var arr = [];

						if ( type.array( node ) && node.length > 0 ){
							node.forEach( function( subnode ){
								arr.push( this._transform( subnode, rule.rules ) );
							}.bind( this ) );
						}

						return arr;
						break;

					case "object":
					case "o":
						if ( type.array( node ) && node.length > 0 ){
							return this._transform( node[ 0 ], rule.rules );
						}
						return;
						break;

					default: 
						throw new Error( "Unknown type «"+rule.type+"» for rule «"+rule.name+"»" ).setName( "InvalidRuleException" );
				}
			}
		}




		, getDateFromNode: function( node, rule ){
			var val = this.getArrayNode0( node )
			, mom;

			if ( rule.format ){
				mom = moment( val, rule.format );
			}
			else {
				mom =  moment( val );
			}

			if ( mom.isValid() ) {
				return mom.toDate();
			}
			else if ( !type.undefined( rule.default ) ) {
				return rule.default;
			}

			return;
		}



		, getBooleanFromNode: function( node ){
			var val = this.getArrayNode0( node ).toLowerCase();
			return ( val === "true" || val === "1" ) ? true : false;
		}



		, getNumberFromNode: function( node, rule ){
			var val = this.getArrayNode0( node );

			try {
				val = parseFloat( val );
			} 
			catch ( err ){
				if ( rule.default ){
					return rule.default;
				}
				return;
			};

			return val;
		}


		, getStringFromNode: function( node ){
			return this.getArrayNode0( node );
		}


		, getArrayNode0: function( node ){
			if ( type.array( node ) ){
				if ( node.length > 0 ){
					return node[ 0 ] + "";
				}
				else {
					return "";
				}
			}
			else {
				throw new Error( "Malformed xml2js output, expected array and got «"+type( node )+"»!" ).setName( "InvalidJSONException" );
			}
		}
	} );
	

	var transformer = new Transformer();


	module.exports = transformer.transform.bind( transformer );