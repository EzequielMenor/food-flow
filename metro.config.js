// Resuelve el alias "@/..." -> ./src/... (mismo mapeo que jest moduleNameMapper y tsconfig paths).
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const SRC = path.resolve(__dirname, 'src');
const previousResolve = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@' || moduleName.startsWith('@/')) {
    const mapped = path.join(SRC, moduleName.slice(2));
    if (previousResolve) {
      return previousResolve(context, mapped, platform);
    }
    return context.resolveRequest(context, mapped, platform);
  }
  if (previousResolve) {
    return previousResolve(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
