const path = require("path");
const { pagePathReWrite } = require("../utils/path-rw");
const PAGE_BUNDLE_PATH = "/*page_bundle_path_placeholder*/";
const HANDLER_FACTORY_PATH = "/*handler_factory_path_placeholder*/";

const lambdaHandlerWithFactory = `
  const page = require("${PAGE_BUNDLE_PATH}");
  const handlerFactory = require("${HANDLER_FACTORY_PATH}");

  module.exports.render = async (event, context) => {
    const { req, res, responsePromise } = handlerFactory(event.Records[0].cf);
    page.render(req, res);
    return responsePromise;
  };
`;

module.exports = (jsHandlerPath, customHandlerPath) => {
  // convert windows path to POSIX
  jsHandlerPath = jsHandlerPath.replace(/\\/g, "/");
  const basename = path.basename(jsHandlerPath, ".js");

  // get relative path to custom handler
  if (customHandlerPath) {
    let pathDepth = jsHandlerPath.split("/").length - 2;
    if (pathDepth > 0) {
      customHandlerPath = customHandlerPath.replace("./", "");
      while (pathDepth-- > 0) {
        customHandlerPath = `../${customHandlerPath}`;
      }
    }
  }

  return lambdaHandlerWithFactory
    .replace(PAGE_BUNDLE_PATH, `./${pagePathReWrite(basename)}.original.js`)
    .replace(HANDLER_FACTORY_PATH, customHandlerPath || "next-aws-cloudfront-custom");
};
