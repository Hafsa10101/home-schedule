// ============================================================
// SCHEDULE DATA  — edit tasks here
// who options: "hafsa" | "adnan" | "both" | "help"
// ============================================================

export const whoConfig = {
  hafsa: { label: "Hafsa", color: "#A0522D", bg: "#FDEEE6", dot: "#C4704A" },
  adnan: { label: "Adnan", color: "#2E6085", bg: "#E2F0FA", dot: "#4A90C4" },
  both:  { label: "Both",  color: "#4A7A5A", bg: "#E4F2E8", dot: "#6AAE7C" },
  help:  { label: "Maid",  color: "#7A5C14", bg: "#FDF5DC", dot: "#C9A227" },
};

export const daily = {
  morning: {
    label: "Morning",
    time: "8:00 AM – 11:30 AM",
    tasks: [
      { id: "d-m-1", task: "Fill water bottles / matka", who: "adnan" },
      { id: "d-m-2", task: "Open windows", who: "hafsa" },
      { id: "d-m-3", task: "Make beds", who: "hafsa" },
      { id: "d-m-4", task: "Tea & breakfast", who: "adnan" },
      { id: "d-m-5", task: "Jhadu + pocha + dishes", who: "help" },
      { id: "d-m-6", task: "Take out trash", who: "adnan" },
    ],
  },
  noon: {
    label: "Noon",
    time: "12:00 PM – 2:30 PM",
    tasks: [
      { id: "d-n-1", task: "Cook lunch + prep dinner", who: "hafsa" },
      { id: "d-n-2", task: "Put dishes + dastarkhan away after eating", who: "adnan" },
      { id: "d-n-3", task: "Quick 15-min tidy — surfaces, sofa & tables", who: "hafsa" },
    ],
  },
  evening: {
    label: "Evening",
    time: "8:30 PM – 9:30 PM",
    tasks: [
      { id: "d-e-1", task: "Serve dinner & put away leftovers", who: "adnan" },
      { id: "d-e-2", task: "15-min reset — everything back in its place", who: "hafsa" },
    ],
  },
};

// dayIndex: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
export const weekly = [
  {
    day: "Monday", dayIndex: 1, emoji: "🫧", focus: "Laundry",
    tasks: [
      { id: "w-mon-1", task: "Load & run washing machine", who: "hafsa" },
      { id: "w-mon-2", task: "Hang clothes to dry", who: "adnan" },
      { id: "w-mon-3", task: "Fold & keep (evening)", who: "hafsa" },
    ],
  },
  {
    day: "Tuesday", dayIndex: 2, emoji: "🚿", focus: "Bathrooms",
    tasks: [
      { id: "w-tue-1", task: "Scrub toilets, basin & bathroom", who: "adnan" },
      { id: "w-tue-2", task: "Wash & replace towels", who: "hafsa" },
      { id: "w-tue-3", task: "Clean sink area", who: "hafsa" },
    ],
  },
  {
    day: "Wednesday", dayIndex: 3, emoji: "🛒", focus: "Groceries (Thu–Sun)",
    tasks: [
      { id: "w-wed-1", task: "Write grocery list for Thu, Fri, Sat, Sun", who: "hafsa" },
      { id: "w-wed-2", task: "Buy groceries", who: "adnan" },
      { id: "w-wed-3", task: "Sort & keep groceries", who: "hafsa" },
    ],
  },
  {
    day: "Thursday", dayIndex: 4, emoji: "📦", focus: "Organise",
    tasks: [
      { id: "w-thu-1", task: "Pick one zone — declutter & tidy it fully", who: "hafsa", note: "sometimes both" },
      { id: "w-thu-2", task: "Clean desk", who: "adnan" },
    ],
  },
  {
    day: "Friday", dayIndex: 5, emoji: "✨", focus: "Dusting",
    tasks: [
      { id: "w-fri-1", task: "Dust all surfaces — fans, table, mirrors & shelves", who: "hafsa" },
    ],
  },
  {
    day: "Saturday", dayIndex: 6, emoji: "🥘", focus: "Kitchen + Meal Prep",
    tasks: [
      { id: "w-sat-1", task: "Clean kitchen (deep wipe down)", who: "hafsa" },
      { id: "w-sat-2", task: "Meal prep — chop veggies, grind masala, cook dal", who: "both" },
    ],
  },
  {
    day: "Sunday", dayIndex: 0, emoji: "🛒", focus: "Groceries (Mon–Wed)",
    tasks: [
      { id: "w-sun-1", task: "Write grocery list for Mon, Tue, Wed", who: "hafsa" },
      { id: "w-sun-2", task: "Buy groceries", who: "adnan" },
      { id: "w-sun-3", task: "Sort & keep groceries", who: "hafsa" },
    ],
  },
];

export const monthly = [
  { id: "m-w1-1", week: "Week 1", task: "Deep clean kitchen — behind stove, fridge interior, chimney filter", who: "both" },
  { id: "m-w1-2", week: "Week 1", task: "Wardrobe sort — donate, store seasonal, fold neatly", who: "hafsa" },
  { id: "m-w2-1", week: "Week 2", task: "Bills & finances review", who: "adnan" },
  { id: "m-w2-2", week: "Week 2", task: "Clean AC filters & fan blades", who: "adnan" },
  { id: "m-w3-1", week: "Week 3", task: "Wipe down all furniture & under-bed area", who: "hafsa" },
  { id: "m-w4-1", week: "Week 4", task: "Pantry audit — restock dried goods, spices & basics", who: "hafsa" },
  { id: "m-w4-2", week: "Week 4", task: "Fix small repairs — dead bulbs, loose handles, etc.", who: "adnan" },
];
