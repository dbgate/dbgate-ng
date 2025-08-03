import plugin from "tailwindcss/plugin";

function makeScale(colors) {
  const stops = {
    50: 95,
    100: 90,
    200: 80,
    300: 70,
    400: 60,
    500: 50,
    600: 40,
    700: 30,
    800: 20,
    900: 12,
    950: 7,
  };
  const out = {};
  const [fromColor, toColor] = colors.split(" ");
  for (const [k, w] of Object.entries(stops)) {
    out[k] = `color-mix(in oklch, ${fromColor} ${w}%, ${toColor} ${100 - w}%)`;
  }
  return out;
}

export default plugin.withOptions(
  (opts = {}) => {
    return ({ addBase, addUtilities }) => {
      const vars = {};
      const utils = {};
      for (const [name, colors] of Object.entries(opts)) {
        if (typeof colors !== "string") continue;

        const shades = makeScale(colors);
        for (const [step, value] of Object.entries(shades)) {
          vars[`--color-${name}-${step}`] = value;
        }
        // map unsuffixed token (text-mainbg) to your canonical step
        vars[`--color-${name}`] = colors.split(" ")[0];

        for (const step of Object.keys(shades)) {
          const v = `var(--color-${name}-${step})`;
          utils[`.text-${name}-${step}`] = { color: v };
          utils[`.bg-${name}-${step}`] = { backgroundColor: v };
          utils[`.border-${name}-${step}`] = { borderColor: v };
        }
        // unsuffixed aliases (point to 500)
        utils[`.text-${name}`] = { color: `var(--color-${name})` };
        utils[`.bg-${name}`] = { backgroundColor: `var(--color-${name})` };
        utils[`.border-${name}`] = { borderColor: `var(--color-${name})` };
      }
      addBase({ ":root": vars });
      addUtilities(utils);
    };
  },
  // 2) “config” phase (optional): return theme/variants if you need them
  () => ({})
);
