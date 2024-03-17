/**
 * 
 * @param {String} name 
 * @returns {String}
 */
export function getEnvOrExit(name) {
  let param = process.env[name];
  if (!param) {
    console.error('#getEnvOrExit | required config param missing:', name);
    process.exit(1);
  }

  return param;
}