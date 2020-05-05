define([
	"skylark-langx/skylark"
],function(skylark) {
	return skylark.attach("intg.Zlib",{
		CompressionMethod : {
		  DEFLATE: 8,
		  RESERVED: 15

		}
	})
});
