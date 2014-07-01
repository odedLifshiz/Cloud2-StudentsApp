


	module.exports = {
		  Name: "name"
		, Prefix: "prefix"
		, Marker: "marker"
		, MaxKeys: { name: "maxKeys", type: "number" }
		, Delimiter: "delimiter"
		, IsTruncated: { name: "truncated", type: "bool" }
		, Contents: { name: "contents", type: "array", rules: 
			{
				  Key: "key"
				, LastModified: { name: "modified", type: "date" }
				, ETag: "etag"
				, Size: { name: "size", type: "number" }
				, Owner: { type: "object", name: "owner", rules: {
					  ID: "id"
					, DisplayName: "name"
				} }
			}
		}
	};