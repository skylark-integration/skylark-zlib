/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib","../crc32","./RawDeflate"],function(t,e,i){var s=function(t,e){this.input=t,this.ip=0,this.output,this.op=0,this.flags={},this.filename,this.comment,this.deflateOptions,e&&(e.flags&&(this.flags=e.flags),"string"==typeof e.filename&&(this.filename=e.filename),"string"==typeof e.comment&&(this.comment=e.comment),e.deflateOptions&&(this.deflateOptions=e.deflateOptions)),this.deflateOptions||(this.deflateOptions={})};return s.DefaultBufferSize=32768,s.prototype.compress=function(){var t,n,a,f,h,o,l,r,p=new Uint8Array(s.DefaultBufferSize),u=0,m=this.input,c=this.ip,g=this.filename,O=this.comment;if(p[u++]=31,p[u++]=139,p[u++]=8,t=0,this.flags.fname&&(t|=s.FlagsMask.FNAME),this.flags.fcomment&&(t|=s.FlagsMask.FCOMMENT),this.flags.fhcrc&&(t|=s.FlagsMask.FHCRC),p[u++]=t,n=(Date.now?Date.now():+new Date)/1e3|0,p[u++]=255&n,p[u++]=n>>>8&255,p[u++]=n>>>16&255,p[u++]=n>>>24&255,p[u++]=0,p[u++]=s.OperatingSystem.UNKNOWN,void 0!==this.flags.fname){for(l=0,r=g.length;l<r;++l)(o=g.charCodeAt(l))>255&&(p[u++]=o>>>8&255),p[u++]=255&o;p[u++]=0}if(this.flags.comment){for(l=0,r=O.length;l<r;++l)(o=O.charCodeAt(l))>255&&(p[u++]=o>>>8&255),p[u++]=255&o;p[u++]=0}return this.flags.fhcrc&&(a=65535&e.calc(p,0,u),p[u++]=255&a,p[u++]=a>>>8&255),this.deflateOptions.outputBuffer=p,this.deflateOptions.outputIndex=u,p=(h=new i(m,this.deflateOptions)).compress(),(u=h.op)+8>p.buffer.byteLength?(this.output=new Uint8Array(u+8),this.output.set(new Uint8Array(p.buffer)),p=this.output):p=new Uint8Array(p.buffer),f=e.calc(m),p[u++]=255&f,p[u++]=f>>>8&255,p[u++]=f>>>16&255,p[u++]=f>>>24&255,r=m.length,p[u++]=255&r,p[u++]=r>>>8&255,p[u++]=r>>>16&255,p[u++]=r>>>24&255,this.ip=c,u<p.length&&(this.output=p=p.subarray(0,u)),p},s.OperatingSystem={FAT:0,AMIGA:1,VMS:2,UNIX:3,VM_CMS:4,ATARI_TOS:5,HPFS:6,MACINTOSH:7,Z_SYSTEM:8,CP_M:9,TOPS_20:10,NTFS:11,QDOS:12,ACORN_RISCOS:13,UNKNOWN:255},s.FlagsMask={FTEXT:1,FHCRC:2,FEXTRA:4,FNAME:8,FCOMMENT:16},t.Gzip=s});
//# sourceMappingURL=sourcemaps/Gzip.js.map
