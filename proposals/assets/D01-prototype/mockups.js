// prints the terminal console's screens as plain text, from the same code the prototype draws.
// usage: node mockups.js 80x24 [lens ...] [--card]
const F = require('./fixture.js'), M = require('./model.js'), C = require('./console.js');
const args = process.argv.slice(2), [W, H] = (args[0] || '80x24').split('x').map(Number);
const card = args.includes('--card'), lenses = args.slice(1).filter(a => !a.startsWith('--'));
for (const lens of lenses.length ? lenses : C.LENSES.map(l => l[0])) {
  const S = M.clone(F), ui = C.newUI(lens); ui.card = card;
  const text = C.draw(S, ui, W, H).text().split('\n');
  const wide = Math.max(...text.map(l => [...l].length));
  if (text.length !== H || wide > W) throw new Error(`${lens} is ${wide}x${text.length}, not ${W}x${H}`);
  console.log(`${lens}${card ? ' / card' : ''} at ${W}x${H}\n${'```'}text\n${text.join('\n')}\n${'```'}\n`);
}
