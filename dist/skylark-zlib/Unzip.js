/**
 * skylark-zlib - A version of zlib.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-zlib/
 * @license MIT
 */
define(["./zlib","./crc32","./RawInflate","./Zip"],function(e,t,i){var r=function(e,t){t=t||{},this.input=e instanceof Array?new Uint8Array(e):e,this.ip=0,this.eocdrOffset,this.numberOfThisDisk,this.startDisk,this.totalEntriesThisDisk,this.totalEntries,this.centralDirectorySize,this.centralDirectoryOffset,this.commentLength,this.comment,this.fileHeaderList,this.filenameToIndex,this.verify=t.verify||!1,this.password=t.password};return r.CompressionMethod=i.CompressionMethod,r.FileHeaderSignature=i.FileHeaderSignature,r.LocalFileHeaderSignature=i.LocalFileHeaderSignature,r.CentralDirectorySignature=i.CentralDirectorySignature,(r.FileHeader=function(e,t){this.input=e,this.offset=t,this.length,this.version,this.os,this.needVersion,this.flags,this.compression,this.time,this.date,this.crc32,this.compressedSize,this.plainSize,this.fileNameLength,this.extraFieldLength,this.fileCommentLength,this.diskNumberStart,this.internalFileAttributes,this.externalFileAttributes,this.relativeOffset,this.filename,this.extraField,this.comment}).prototype.parse=function(){var e=this.input,t=this.offset;if(e[t++]!==r.FileHeaderSignature[0]||e[t++]!==r.FileHeaderSignature[1]||e[t++]!==r.FileHeaderSignature[2]||e[t++]!==r.FileHeaderSignature[3])throw new Error("invalid file header signature");this.version=e[t++],this.os=e[t++],this.needVersion=e[t++]|e[t++]<<8,this.flags=e[t++]|e[t++]<<8,this.compression=e[t++]|e[t++]<<8,this.time=e[t++]|e[t++]<<8,this.date=e[t++]|e[t++]<<8,this.crc32=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.compressedSize=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.plainSize=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.fileNameLength=e[t++]|e[t++]<<8,this.extraFieldLength=e[t++]|e[t++]<<8,this.fileCommentLength=e[t++]|e[t++]<<8,this.diskNumberStart=e[t++]|e[t++]<<8,this.internalFileAttributes=e[t++]|e[t++]<<8,this.externalFileAttributes=e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24,this.relativeOffset=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.filename=String.fromCharCode.apply(null,e.subarray(t,t+=this.fileNameLength)),this.extraField=e.subarray(t,t+=this.extraFieldLength),this.comment=e.subarray(t,t+this.fileCommentLength),this.length=t-this.offset},(r.LocalFileHeader=function(e,t){this.input=e,this.offset=t,this.length,this.needVersion,this.flags,this.compression,this.time,this.date,this.crc32,this.compressedSize,this.plainSize,this.fileNameLength,this.extraFieldLength,this.filename,this.extraField}).Flags=i.Flags,r.LocalFileHeader.prototype.parse=function(){var e=this.input,t=this.offset;if(e[t++]!==r.LocalFileHeaderSignature[0]||e[t++]!==r.LocalFileHeaderSignature[1]||e[t++]!==r.LocalFileHeaderSignature[2]||e[t++]!==r.LocalFileHeaderSignature[3])throw new Error("invalid local file header signature");this.needVersion=e[t++]|e[t++]<<8,this.flags=e[t++]|e[t++]<<8,this.compression=e[t++]|e[t++]<<8,this.time=e[t++]|e[t++]<<8,this.date=e[t++]|e[t++]<<8,this.crc32=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.compressedSize=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.plainSize=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.fileNameLength=e[t++]|e[t++]<<8,this.extraFieldLength=e[t++]|e[t++]<<8,this.filename=String.fromCharCode.apply(null,e.subarray(t,t+=this.fileNameLength)),this.extraField=e.subarray(t,t+=this.extraFieldLength),this.length=t-this.offset},r.prototype.searchEndOfCentralDirectoryRecord=function(){var e,t=this.input;for(e=t.length-12;e>0;--e)if(t[e]===r.CentralDirectorySignature[0]&&t[e+1]===r.CentralDirectorySignature[1]&&t[e+2]===r.CentralDirectorySignature[2]&&t[e+3]===r.CentralDirectorySignature[3])return void(this.eocdrOffset=e);throw new Error("End of Central Directory Record not found")},r.prototype.parseEndOfCentralDirectoryRecord=function(){var e,t=this.input;if(this.eocdrOffset||this.searchEndOfCentralDirectoryRecord(),e=this.eocdrOffset,t[e++]!==r.CentralDirectorySignature[0]||t[e++]!==r.CentralDirectorySignature[1]||t[e++]!==r.CentralDirectorySignature[2]||t[e++]!==r.CentralDirectorySignature[3])throw new Error("invalid signature");this.numberOfThisDisk=t[e++]|t[e++]<<8,this.startDisk=t[e++]|t[e++]<<8,this.totalEntriesThisDisk=t[e++]|t[e++]<<8,this.totalEntries=t[e++]|t[e++]<<8,this.centralDirectorySize=(t[e++]|t[e++]<<8|t[e++]<<16|t[e++]<<24)>>>0,this.centralDirectoryOffset=(t[e++]|t[e++]<<8|t[e++]<<16|t[e++]<<24)>>>0,this.commentLength=t[e++]|t[e++]<<8,this.comment=t.subarray(e,e+this.commentLength)},r.prototype.parseFileHeader=function(){var e,t,i,s,n=[],a={};if(!this.fileHeaderList){for(void 0===this.centralDirectoryOffset&&this.parseEndOfCentralDirectoryRecord(),e=this.centralDirectoryOffset,i=0,s=this.totalEntries;i<s;++i)(t=new r.FileHeader(this.input,e)).parse(),e+=t.length,n[i]=t,a[t.filename]=i;if(this.centralDirectorySize<e-this.centralDirectoryOffset)throw new Error("invalid file header size");this.fileHeaderList=n,this.filenameToIndex=a}},r.prototype.getFileData=function(e,i){i=i||{};var s,n,a,o,h,l,f,c,d=this.input,p=this.fileHeaderList;if(p||this.parseFileHeader(),void 0===p[e])throw new Error("wrong index");if(n=p[e].relativeOffset,(s=new r.LocalFileHeader(this.input,n)).parse(),n+=s.length,a=s.compressedSize,0!=(s.flags&r.LocalFileHeader.Flags.ENCRYPT)){if(!i.password&&!this.password)throw new Error("please set password");for(l=this.createDecryptionKey(i.password||this.password),f=n,c=n+12;f<c;++f)this.decode(l,d[f]);for(f=n+=12,c=n+(a-=12);f<c;++f)d[f]=this.decode(l,d[f])}switch(s.compression){case r.CompressionMethod.STORE:o=this.input.subarray(n,n+a);break;case r.CompressionMethod.DEFLATE:o=new t(this.input,{index:n,bufferSize:s.plainSize}).decompress();break;default:throw new Error("unknown compression type")}if(this.verify&&(h=CRC32.calc(o),s.crc32!==h))throw new Error("wrong crc: file=0x"+s.crc32.toString(16)+", data=0x"+h.toString(16));return o},r.prototype.getFilenames=function(){var e,t,i,r=[];for(this.fileHeaderList||this.parseFileHeader(),e=0,t=(i=this.fileHeaderList).length;e<t;++e)r[e]=i[e].filename;return r},r.prototype.decompress=function(e,t){var i;if(this.filenameToIndex||this.parseFileHeader(),void 0===(i=this.filenameToIndex[e]))throw new Error(e+" not found");return this.getFileData(i,t)},r.prototype.setPassword=function(e){this.password=e},r.prototype.decode=function(e,t){return t^=this.getByte(e),this.updateKeys(e,t),t},r.prototype.updateKeys=i.prototype.updateKeys,r.prototype.createDecryptionKey=i.prototype.createEncryptionKey,r.prototype.getByte=i.prototype.getByte,e.Unzip=r});
//# sourceMappingURL=sourcemaps/Unzip.js.map
