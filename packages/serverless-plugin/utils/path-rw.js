module.exports.pagePathReWrite = path => {
  return path.replace(/\.\.\./g, "___");
};