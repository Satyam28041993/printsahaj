/*
 * Word lists the class teacher sent for exam preparation (Sr. KG-A, EVS,
 * 30/10/2026: "Write and learn", "Write and learn fruit's name",
 * "Practice at home animals name / fruit's name / colour name").
 * Order is the order on the sheets. Pictures are emoji, except papaya, which
 * has none, so it is a small drawing of our own.
 */

const papayaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
<ellipse cx="60" cy="62" rx="34" ry="50" fill="#7cb342"/>
<ellipse cx="60" cy="62" rx="29" ry="45" fill="#ffb300"/>
<ellipse cx="60" cy="62" rx="25" ry="40" fill="#ff7a33"/>
<ellipse cx="60" cy="68" rx="11" ry="22" fill="#ffc08a"/>
<g fill="#2b1a10">
<circle cx="56" cy="54" r="3"/><circle cx="64" cy="56" r="3"/><circle cx="57" cy="63" r="3"/>
<circle cx="64" cy="66" r="3"/><circle cx="56" cy="72" r="3"/><circle cx="63" cy="76" r="3"/>
<circle cx="59" cy="83" r="3"/>
</g>
<path d="M60 12 q4 -8 12 -8" stroke="#5d4037" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;

export const PAPAYA = `data:image/svg+xml,${encodeURIComponent(papayaSvg)}`;

export type Item = { name: string; picture: string };

/** "Write and learn fruit's name": the first letter is printed (S…, M…). */
export const TEACHER_FRUITS: Item[] = [
  { name: "Strawberry", picture: "🍓" },
  { name: "Mango", picture: "🥭" },
  { name: "Apple", picture: "🍎" },
  { name: "Papaya", picture: PAPAYA },
  { name: "Banana", picture: "🍌" },
  { name: "Watermelon", picture: "🍉" },
  { name: "Orange", picture: "🍊" },
  { name: "Grapes", picture: "🍇" },
  { name: "Pineapple", picture: "🍍" },
];

/** "Write and learn" animals grid, row by row. */
export const TEACHER_ANIMALS: Item[] = [
  { name: "Pig", picture: "🐷" },
  { name: "Goat", picture: "🐐" },
  { name: "Sheep", picture: "🐑" },
  { name: "Horse", picture: "🐴" },
  { name: "Cow", picture: "🐄" },
  { name: "Lion", picture: "🦁" },
  { name: "Elephant", picture: "🐘" },
  { name: "Zebra", picture: "🦓" },
  { name: "Deer", picture: "🦌" },
  { name: "Monkey", picture: "🐵" },
  { name: "Giraffe", picture: "🦒" },
  { name: "Tiger", picture: "🐯" },
];

/** "Colours name learn at home" (30/10): match each colour to its name, in
 * the sheet's order. The words on the sheet: Brown, Green, Blue, Yellow, Red. */
export const TEACHER_COLOURS: Item[] = [
  { name: "Yellow", picture: "🟡" },
  { name: "Blue", picture: "🔵" },
  { name: "Red", picture: "🔴" },
  { name: "Brown", picture: "🟤" },
  { name: "Green", picture: "🟢" },
];

/** More colour names for learning (the usual Sr. KG ten). */
export const COLOURS: Item[] = [
  { name: "Red", picture: "🔴" },
  { name: "Blue", picture: "🔵" },
  { name: "Green", picture: "🟢" },
  { name: "Yellow", picture: "🟡" },
  { name: "Orange", picture: "🟠" },
  { name: "Pink", picture: "🩷" },
  { name: "Purple", picture: "🟣" },
  { name: "Brown", picture: "🟤" },
  { name: "Black", picture: "⚫" },
  { name: "White", picture: "⚪" },
];

/** Two wrong choices from the same list, the next ones after the item. */
export function others(list: Item[], i: number, n = 2): string[] {
  const out: string[] = [];
  for (let k = 1; out.length < n && k < list.length; k++) {
    const name = list[(i + k * 3) % list.length].name;
    if (name !== list[i].name && !out.includes(name)) out.push(name);
  }
  return out;
}
