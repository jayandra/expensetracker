
const colorClassMap = {
  primary: {
    '50': 'bg-primary-50',
    '100': 'bg-primary-100',
    '200': 'bg-primary-200',
    '300': 'bg-primary-300',
    '400': 'bg-primary-400',
    '500': 'bg-primary-500',
    '600': 'bg-primary-600',
    '700': 'bg-primary-700',
    '800': 'bg-primary-800',
    '900': 'bg-primary-900',
  },
  secondary: {
    '50': 'bg-secondary-50',
    '100': 'bg-secondary-100',
    '200': 'bg-secondary-200',
    '300': 'bg-secondary-300',
    '400': 'bg-secondary-400',
    '500': 'bg-secondary-500',
    '600': 'bg-secondary-600',
    '700': 'bg-secondary-700',
    '800': 'bg-secondary-800',
    '900': 'bg-secondary-900',
  },
  success: {
    '50': 'bg-success-50',
    '100': 'bg-success-100',
    '200': 'bg-success-200',
    '300': 'bg-success-300',
    '400': 'bg-success-400',
    '500': 'bg-success-500',
    '600': 'bg-success-600',
    '700': 'bg-success-700',
    '800': 'bg-success-800',
    '900': 'bg-success-900',
  },
  warning: {
    '50': 'bg-warning-50',
    '100': 'bg-warning-100',
    '200': 'bg-warning-200',
    '300': 'bg-warning-300',
    '400': 'bg-warning-400',
    '500': 'bg-warning-500',
    '600': 'bg-warning-600',
    '700': 'bg-warning-700',
    '800': 'bg-warning-800',
    '900': 'bg-warning-900',
  },
  error: {
    '50': 'bg-error-50',
    '100': 'bg-error-100',
    '200': 'bg-error-200',
    '300': 'bg-error-300',
    '400': 'bg-error-400',
    '500': 'bg-error-500',
    '600': 'bg-error-600',
    '700': 'bg-error-700',
    '800': 'bg-error-800',
    '900': 'bg-error-900',
  },
  neutral: {
    '50': 'bg-neutral-50',
    '100': 'bg-neutral-100',
    '200': 'bg-neutral-200',
    '300': 'bg-neutral-300',
    '400': 'bg-neutral-400',
    '500': 'bg-neutral-500',
    '600': 'bg-neutral-600',
    '700': 'bg-neutral-700',
    '800': 'bg-neutral-800',
    '900': 'bg-neutral-900',
  },
} as const;

type ColorGroup = keyof typeof colorClassMap;
type Shade = keyof typeof colorClassMap.primary;

const ColorPalette = () => {
  const colorGroups = Object.keys(colorClassMap) as ColorGroup[];
  const shades = Object.keys(colorClassMap.primary) as Shade[];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Color Palette</h1>
      
      <div className="space-y-8">
        {colorGroups.map(group => (
          <div key={group}>
            <h2 className="text-lg font-semibold mb-3 capitalize">{group}</h2>
            <div className="flex flex-wrap gap-2">
              {shades.map(shade => (
                <div key={`${group}-${shade}`} className="flex flex-col items-center">
                  <div 
                    className={`w-24 h-24 rounded-md flex items-center justify-center text-xs ${colorClassMap[group][shade]}`}
                  >
                    {shade}
                  </div>
                  <div className="mt-1 text-xs">{colorClassMap[group][shade]}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
