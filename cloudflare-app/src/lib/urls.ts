export function getRunnerOrigin(): string {
  const loc = window.location;
  const host = loc.hostname;

  if (host.startsWith("run.")) return loc.origin;
  if (host.startsWith("portal.")) return `${loc.protocol}//${host.replace(/^portal\./, "run.")}`;
  // root domain: default to run.betterquest.ie
  return `${loc.protocol}//run.betterquest.ie`;
}
