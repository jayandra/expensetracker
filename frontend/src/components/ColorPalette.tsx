
import colors from '../config/colors';

const colorPalette = colors;

const ColorPalette = () => {
  const colorGroups = Object.entries(colorPalette).map(([name, colors]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    colors,
    textColor: name === 'warning' ? 'text-neutral-900' : 'text-white',
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Color Palette</h1>
      
      <div className="space-y-12">
        {colorGroups.map((group) => (
          <div key={group.name} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">{group.name}</h2>
            <div className="grid grid-cols-10 gap-2">
              {Object.entries(group.colors).map(([shade, hex]) => (
                <div key={shade} className="flex flex-col items-center">
                  <div 
                    className="w-20 h-20 rounded-md shadow-sm flex items-center justify-center text-xs font-mono"
                    style={{ backgroundColor: hex, color: parseInt(shade) < 500 ? '#111827' : '#fff' }}
                    title={`${group.name.toLowerCase()}-${shade}`}
                  >
                    {shade}
                  </div>
                  <div className="mt-1 text-xs text-neutral-600">{shade}</div>
                  <div className="text-xs text-neutral-500 font-mono">
                    {`${group.name.toLowerCase()}-${shade}`}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div 
                  className="p-3 rounded-md text-sm text-white"
                  style={{ backgroundColor: group.colors[500] }}
                >
                  Primary Button
                </div>
                <div 
                  className="p-3 rounded-md text-sm"
                  style={{ 
                    backgroundColor: group.colors[100],
                    color: group.colors[800]
                  }}
                >
                  Secondary Button
                </div>
                <div 
                  className="p-3 rounded-md text-sm border"
                  style={{ 
                    borderColor: group.colors[300],
                    color: group.colors[700]
                  }}
                >
                  Outline Button
                </div>
              </div>
              <div className="space-y-2">
                <div 
                  className="p-3 rounded-md text-sm"
                  style={{ backgroundColor: group.colors[50] }}
                >
                  <p 
                    className="font-medium"
                    style={{ color: group.colors[700] }}
                  >
                    Info Card
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: group.colors[600] }}
                  >
                    This is a sample info card using {group.name} colors
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div 
                  className="text-sm"
                  style={{ color: group.colors[600] }}
                >
                  <p>• Text color example</p>
                  <p className="opacity-75 text-xs">• Lighter text</p>
                </div>
                <div 
                  className="pl-3 py-1 border-l-4"
                  style={{ borderColor: group.colors[400] }}
                >
                  <p className="text-sm">Highlighted text</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
