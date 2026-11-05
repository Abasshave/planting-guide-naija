/* Planting Guide Naija - crop data + hand-drawn SVG diagrams
   NOTE: Please check numbers with IITA / your local extension officer before you publish. */
(function () {
  const defaultSteps = (c) => [
    'Clear the land and remove weeds. Make flat beds or ridges.',
    `Mark your rows ${c.row} cm apart.`,
    `Dig holes ${c.hole} cm apart. Each hole is ${c.depth} cm deep.`,
    `Put ${c.seeds} seed${c.seeds === '1' ? '' : 's'} in each hole. Cover lightly with soil.`,
    'Water well in the morning or evening.',
    'After about 2 weeks, keep the strongest plant in each hole and pull out the weak ones.'
  ];

  const nurserySteps = (c, weeks) => [
    `Sow seeds ${c.depth} cm deep in a small nursery bed. Water every morning and evening.`,
    `Keep the nursery in light shade. Seedlings are ready in ${weeks} weeks (when 10-15 cm tall).`,
    'Prepare the farm: clear weeds, make ridges, mix in compost or manure.',
    `Mark rows ${c.row} cm apart and plant holes ${c.hole} cm apart.`,
    'Transplant in the evening or on a cloudy day. Water straight away.',
    'Weed often. Add stakes or sticks if the plant grows tall.'
  ];

  window.CROPS = [
    {
      id: 'okra', search: 'okra pods', name: 'Okra', emoji: '🌿', grad: ['#b7e36b', '#4c9a2a'],
      days: [50, 65], difficulty: 'Easy', badge: 'Hot', seasons: ['rainy', 'dry'],
      depth: 2, seeds: '1-2', hole: 45, row: 60,
      water: 'Morning and evening until seeds sprout. After that, every 2-3 days.',
      sun: 'Full sun, 6-8 hours every day.',
      soil: 'Loose, well-drained loam. Mix in compost or animal manure before planting.',
      best: 'Start of the rainy season. In dry season, plant only if you can water.',
      avoid: 'Water-logged land and shade.',
      thin: 'When seedlings are about 10 cm tall, pull out the weakest one. Keep one strong plant in each hole.',
      signs: ['Pods are 7-10 cm long', 'Pods snap easily when bent', 'Pods are still soft, not hard'],
      harvestHow: ['Cut the pod with a small knife. Leave a short stem.', 'Harvest every 2 days. Old pods make the plant stop giving.', 'Wear gloves. Okra leaves can itch.'],
      stages: [['Day 0', 'Plant the seeds'], ['Day 5-7', 'Seedlings come out'], ['Week 3', 'Thin and weed'], ['Week 6-7', 'Flowers appear'], ['Day 50-65', 'First pods ready']],
      store: 'Eat or sell the same day. Keep in a cool, dry basket. It stays fresh for 2-3 days.',
      pests: 'Check for small green bugs and holes in leaves. Spray neem leaf water in the evening.',
      tip: 'Soak seeds in water for 12 hours before planting. They sprout faster.',
      photos: ['Okra.jpg', 'Abelmoschus_esculentus_-_Okra.jpg', 'Okra_pods.jpg']
    },
    {
      id: 'tomato', search: 'tomato fruit', name: 'Tomato', emoji: '🍅', grad: ['#ff8a80', '#c62828'],
      days: [70, 85], difficulty: 'Medium', badge: 'Recommended', seasons: ['dry', 'rainy'],
      depth: 1, seeds: '2', hole: 50, row: 75,
      water: 'Every morning for the first 2 weeks. Then every 2 days. Water at the root, not on leaves.',
      sun: 'Full sun, at least 6 hours.',
      soil: 'Rich, loose, well-drained soil. pH 6-7. Add manure before planting.',
      best: 'Dry season with watering gives the best fruits. In rainy season use raised beds.',
      avoid: 'Low land where water stays. Heavy rain makes fruits rot.',
      thin: 'In the nursery, keep the strongest seedling when 2 come up together.',
      steps: null, nurseryWeeks: 3,
      signs: ['Fruit turns from green to red', 'Fruit feels firm but not hard', 'Pick at first colour if you must carry far'],
      harvestHow: ['Twist or cut the fruit with its small stem.', 'Pick in the cool morning.', 'Harvest every 3-4 days.'],
      stages: [['Day 0', 'Sow in nursery'], ['Week 3-4', 'Transplant to the farm'], ['Week 6', 'Flowers appear'], ['Week 8-9', 'Green fruits grow'], ['Day 70-85', 'Red fruits ready']],
      store: 'Keep in a cool, shaded place. Do not pile them high. Ripe tomatoes last 3-5 days.',
      pests: 'Watch for leaf curl, wilting and fruit borer holes. Remove sick plants early.',
      tip: 'Use sticks to hold the plant up so fruits do not touch the soil.',
      photos: ['Tomato_je.jpg', 'Bright_red_tomato_and_cross_section02.jpg', 'Tomatoes_on_the_vine.jpg']
    },
    {
      id: 'pepper', search: 'chili pepper plant', name: 'Pepper', emoji: '🌶️', grad: ['#ffab91', '#d84315'],
      days: [60, 80], difficulty: 'Medium', badge: 'Spicy', seasons: ['dry', 'rainy'],
      depth: 1, seeds: '2', hole: 45, row: 60,
      water: 'Water every morning at first. Then every 2-3 days. Do not flood.',
      sun: 'Full sun, 6-8 hours.',
      soil: 'Well-drained loam with manure. pH 6-7.',
      best: 'Early rainy season or dry season with watering.',
      avoid: 'Standing water. Roots rot fast.',
      thin: 'Keep the strongest seedling. Pull the weak one gently.',
      steps: null, nurseryWeeks: 4,
      signs: ['Fruits are full size and shiny', 'Colour changes to red, yellow or orange', 'Fruit comes off with a light pull'],
      harvestHow: ['Cut with a small knife. Do not pull the branch.', 'Harvest every week.', 'Wash your hands after. Pepper burns eyes.'],
      stages: [['Day 0', 'Sow in nursery'], ['Week 4-5', 'Transplant'], ['Week 7', 'Flowers appear'], ['Week 9', 'Fruits form'], ['Day 60-80', 'Ready to pick']],
      store: 'Dry in the sun for 3-5 days on a clean mat. Store in a dry bag.',
      pests: 'Look for aphids and curled leaves. Spray neem leaf water.',
      tip: 'Remove the first few flowers. The plant grows stronger and gives more later.',
      photos: ['Capsicum_annuum_-_Chili.jpg', 'Chili_peppers.jpg', 'Red_hot_chili_peppers.jpg']
    },
    {
      id: 'maize', search: 'maize corn cob', name: 'Maize', emoji: '🌽', grad: ['#ffe082', '#f9a825'],
      days: [90, 100], difficulty: 'Easy', badge: 'Staple', seasons: ['rainy'],
      depth: 4, seeds: '2', hole: 25, row: 75,
      water: 'Plant after good rain. If rain stops for a week, water in the evening.',
      sun: 'Full sun.',
      soil: 'Deep, well-drained loam. Rich in manure or NPK fertiliser.',
      best: 'Rainy season. Plant after the first steady rains.',
      avoid: 'Shade and flooded land.',
      thin: 'At 2 weeks, keep one strong plant per hole. Pull the weak one.',
      signs: ['Husks turn dry and brown', 'Silk at the top is dark brown', 'Grains are hard when you press with a nail'],
      harvestHow: ['Twist the cob down and pull off.', 'For roasting, harvest earlier when grains are milky.', 'Dry cobs in the sun before shelling.'],
      stages: [['Day 0', 'Plant the seeds'], ['Day 5-7', 'Seedlings come out'], ['Week 3', 'Thin and add fertiliser'], ['Week 8', 'Tassels and silk show'], ['Day 90-100', 'Dry cobs ready']],
      store: 'Dry grains until they are hard. Store in clean bags, off the floor.',
      pests: 'Look for armyworm in the leaf whorl. Check every 2-3 days.',
      tip: 'Plant after the first rain for the best yield.',
      photos: ['Corncobs.jpg', 'Maize_Zea_mays.jpg', 'Sweet_corn.jpg']
    },
    {
      id: 'cassava', search: 'cassava roots', name: 'Cassava', emoji: '🥔', grad: ['#d7ccc8', '#8d6e63'],
      days: [270, 365], difficulty: 'Easy', badge: 'Tough', seasons: ['rainy'],
      depth: 10, seeds: '1 stem cutting', hole: 100, row: 100, seedShape: 'stick',
      water: 'Water once a week in the first month if rain is not steady. After that, rain is enough.',
      sun: 'Full sun.',
      soil: 'Light, sandy or loamy soil. It grows even in poor soil.',
      best: 'Early rainy season so roots are strong before the dry season.',
      avoid: 'Water-logged soil. Roots will rot.',
      steps: [
        'Choose healthy stems from a mature plant. Cut pieces 25 cm long with 4-5 nodes (buds).',
        'Clear the land and make ridges or mounds, 100 cm apart.',
        'Plant one cutting every 100 cm. Push it 10 cm deep, slanting or flat.',
        'Keep the buds pointing up.',
        'Weed at 4 weeks and 10 weeks.',
        'If many shoots come up from one cutting, keep the strongest 1-2.'
      ],
      thin: 'If many shoots come from one cutting, keep only the strongest 1 or 2.',
      signs: ['Leaves at the bottom turn yellow and fall', 'Roots are thick (dig one to check)', 'It is 9-12 months old'],
      harvestHow: ['Loosen the soil around the plant.', 'Pull the stem slowly and lift the roots.', 'Cut the roots off. Process within 2 days.'],
      stages: [['Day 0', 'Plant the cuttings'], ['Week 2-3', 'Shoots come out'], ['Month 2', 'Weed and thin shoots'], ['Month 6', 'Roots are growing'], ['Month 9-12', 'Ready to harvest']],
      store: 'Cassava spoils in 2-3 days. Process into garri, fufu or chips quickly.',
      pests: 'Watch for mosaic disease (yellow, twisted leaves). Remove sick plants.',
      tip: 'Use cuttings from healthy plants only. Bad cuttings give a bad harvest.',
      photos: ['Cassava_roots.jpg', 'Manihot_esculenta_dsc07325.jpg', 'Cassava.jpg']
    },
    {
      id: 'yam', search: 'yam tubers', name: 'Yam', emoji: '🍠', grad: ['#ce93d8', '#7b1fa2'],
      days: [180, 270], difficulty: 'Medium', badge: 'King crop', seasons: ['rainy'],
      depth: 15, seeds: '1 seed yam piece', hole: 100, row: 100, seedShape: 'blob',
      water: 'Rain is enough. If dry for 2 weeks, water the mound in the evening.',
      sun: 'Full sun. Give the vine a stake or tree to climb.',
      soil: 'Deep, loose, well-drained soil. Make high mounds or ridges.',
      best: 'Plant at the start of the rains (March to May in the south).',
      avoid: 'Hard soil and water-logged land.',
      steps: [
        'Cut seed yam into pieces of 200-300 g. Dry the cut side in the sun for 1-2 days.',
        'Make mounds about 1 m wide and 50 cm high, 100 cm apart.',
        'Plant 1 piece in each mound, 15 cm deep, cut side down.',
        'Cover with soil and lay dry grass on top (mulch).',
        'When the vine grows, tie it to a stake 2 m tall.',
        'Weed the mound often. Do not step on it.'
      ],
      thin: 'Keep one strong vine per mound. Cut off the extra weak vines.',
      signs: ['Leaves turn yellow and dry', 'Vine starts to die back', 'It is 6-9 months old'],
      harvestHow: ['Dig a wide circle around the mound.', 'Lift the tuber slowly with a fork or digger.', 'Do not cut or bruise the yam.'],
      stages: [['Day 0', 'Plant the seed yam'], ['Week 3-5', 'Vines appear'], ['Month 3', 'Stake and weed'], ['Month 5-6', 'Tubers swell'], ['Month 6-9', 'Ready to harvest']],
      store: 'Keep in a yam barn in the shade with air flow. Do not stack wet yams.',
      pests: 'Check for termites and rot in storage. Remove bad yams quickly.',
      tip: 'Dry the cut seed yam in the sun. It stops rot after planting.',
      photos: ['Yams.jpg', 'Dioscorea_alata.jpg', 'Yam_(Dioscorea_alata).jpg']
    },
    {
      id: 'beans', search: 'cowpea beans', name: 'Beans', emoji: '🫘', grad: ['#bcaaa4', '#6d4c41'],
      days: [60, 75], difficulty: 'Easy', badge: 'Protein', seasons: ['rainy'],
      depth: 3, seeds: '2-3', hole: 20, row: 50,
      water: 'Water lightly in the morning. Do not over-water. Flowering needs steady moisture.',
      sun: 'Full sun.',
      soil: 'Light, well-drained soil. Beans fix nitrogen, so little fertiliser is needed.',
      best: 'Mid to late rainy season (cowpea). Not during heavy flood rains.',
      avoid: 'Water-logged soil.',
      thin: 'After 10 days keep the 2 strongest plants in each hole.',
      signs: ['Pods turn yellow or brown and dry', 'Seeds rattle inside the pod', 'Most pods on the plant are dry'],
      harvestHow: ['Pick dry pods by hand every few days.', 'Pick in the morning when pods are not too dry.', 'Spread to dry in the sun, then shell.'],
      stages: [['Day 0', 'Plant the seeds'], ['Day 4-6', 'Seedlings come out'], ['Week 3', 'Weed and thin'], ['Week 5-6', 'Flowers appear'], ['Day 60-75', 'Dry pods ready']],
      store: 'Dry well. Mix in dry neem leaves or ash. Store in airtight bags to stop weevils.',
      pests: 'Watch for aphids, pod borers and weevils in storage.',
      tip: 'Rotate beans after maize. The soil gets richer.',
      photos: ['Cowpeas.jpg', 'Vigna_unguiculata.jpg', 'Black-eyed_peas.jpg']
    },
    {
      id: 'rice', search: 'rice plant field', name: 'Rice', emoji: '🌾', grad: ['#fff59d', '#9ccc65'],
      days: [100, 130], difficulty: 'Medium', badge: 'Needs water', seasons: ['rainy'],
      depth: 3, seeds: '3-4 (nursery)', hole: 20, row: 20,
      water: 'Keep 3-5 cm of water in the field after seedlings settle. Drain before harvest.',
      sun: 'Full sun.',
      soil: 'Clay or loam that holds water. Flat land with bunds (small walls).',
      best: 'Rainy season, or dry season where you have irrigation.',
      avoid: 'Sandy soil that drains fast.',
      steps: [
        'Sow seeds in a nursery bed. Keep the soil wet.',
        'After 3 weeks, level the field and let water stand 2-3 cm.',
        'Pull seedlings and plant 2-3 seedlings per hill.',
        'Space hills 20 cm apart in rows 20 cm apart.',
        'Keep 3-5 cm of water. Weed at 3 weeks and 6 weeks.',
        'Drain the field 2 weeks before harvest.'
      ],
      thin: 'Plant 2-3 seedlings per hill. Replace any that die in the first week.',
      signs: ['Most grains turn golden yellow', 'Leaves near the top start to dry', 'Grains are hard when you bite'],
      harvestHow: ['Cut with a sickle near the base.', 'Tie in bundles and dry 2-3 days.', 'Thresh and dry grains well.'],
      stages: [['Day 0', 'Sow in nursery'], ['Week 3', 'Transplant to field'], ['Week 8', 'Tillers grow'], ['Week 12', 'Heads form'], ['Day 100-130', 'Golden grains ready']],
      store: 'Dry grains to 14% moisture. Store in clean, airtight bags.',
      pests: 'Watch for birds near harvest. Check for stem borer and blast disease.',
      tip: 'Keep birds away with a scarecrow or shiny ribbons near harvest.',
      photos: ['Rice_plant_(Oryza_sativa).jpg', 'Rice_field.jpg', 'Rice_paddy_field.jpg']
    },
    {
      id: 'watermelon', search: 'watermelon fruit', name: 'Watermelon', emoji: '🍉', grad: ['#a5d6a7', '#2e7d32'],
      days: [80, 95], difficulty: 'Medium', badge: 'Sweet', seasons: ['dry'],
      depth: 3, seeds: '2', hole: 100, row: 150,
      water: 'Water every morning until vines spread. Then every 2-3 days. Stop watering a week before harvest.',
      sun: 'Full sun, long hot days.',
      soil: 'Sandy loam with good drainage. Add manure under each hole.',
      best: 'Dry season with watering, or end of the rains.',
      avoid: 'Heavy rain at fruiting. Fruits rot.',
      thin: 'Keep the 1 strongest vine per hole at 2 weeks. Pull the weak one.',
      signs: ['The curly tendril near the fruit is dry', 'The spot touching the ground turns yellow', 'The fruit sounds hollow when you knock it'],
      harvestHow: ['Cut the stem with a knife. Leave 5 cm of stem.', 'Do not pull. It breaks the vine.', 'Carry gently. Do not drop.'],
      stages: [['Day 0', 'Plant the seeds'], ['Day 5-7', 'Seedlings come out'], ['Week 3', 'Vines start running'], ['Week 6', 'Yellow flowers appear'], ['Day 80-95', 'Ripe fruits']],
      store: 'Keep in the shade. A whole watermelon lasts 1-2 weeks.',
      pests: 'Check for fruit flies and ants. Cover young fruits with dry grass.',
      tip: 'Put dry grass under each fruit so it does not touch wet soil.',
      photos: ['Watermelon_cross_BNC.jpg', 'Watermelons.jpg', 'Watermelon.jpg']
    },
    {
      id: 'cucumber', search: 'cucumber vegetable', name: 'Cucumber', emoji: '🥒', grad: ['#c5e1a5', '#558b2f'],
      days: [50, 65], difficulty: 'Easy', badge: 'Quick', seasons: ['rainy', 'dry'],
      depth: 3, seeds: '2', hole: 40, row: 90,
      water: 'Water every morning. Never let soil dry out fully.',
      sun: 'Full sun, 6+ hours.',
      soil: 'Light, rich loam that drains well. Add compost.',
      best: 'Early rainy season or dry season with watering.',
      avoid: 'Heavy clay and shade.',
      thin: 'At 2 weeks, keep the strongest plant per hole.',
      signs: ['Fruit is 15-20 cm long and green', 'Skin is smooth and shiny', 'Pick before it turns yellow'],
      harvestHow: ['Cut with a small knife. Leave a bit of stem.', 'Pick every 2 days.', 'Pick in the morning.'],
      stages: [['Day 0', 'Plant the seeds'], ['Day 4-6', 'Seedlings come out'], ['Week 3', 'Vines start to climb'], ['Week 5', 'Flowers appear'], ['Day 50-65', 'First cucumbers']],
      store: 'Keep cool. They stay fresh for 5-7 days.',
      pests: 'Watch for beetles and mildew (white powder on leaves).',
      tip: 'Use sticks or a net so the vines climb. Fruits stay clean and straight.',
      photos: ['ARS_cucumber.jpg', 'Cucumbers.jpg', 'Cucumis_sativus.jpg']
    },
    {
      id: 'groundnut', search: 'peanut groundnut plant', name: 'Groundnut', emoji: '🥜', grad: ['#ffcc80', '#ef6c00'],
      days: [90, 120], difficulty: 'Easy', badge: 'Cash crop', seasons: ['rainy'],
      depth: 4, seeds: '1-2', hole: 15, row: 50,
      water: 'Rain is enough. Water lightly if dry for 10 days, especially at flowering.',
      sun: 'Full sun.',
      soil: 'Loose, sandy loam. Pods need soft soil to push in.',
      best: 'Rainy season.',
      avoid: 'Heavy, hard clay soil.',
      thin: 'At 2 weeks, keep 1 strong plant per hole.',
      signs: ['Leaves turn yellow', 'Inside of the shell has dark lines', 'Pods are full when you open one'],
      harvestHow: ['Loosen the soil and pull the whole plant.', 'Shake off soil.', 'Dry in the sun for 5-7 days.'],
      stages: [['Day 0', 'Plant the seeds'], ['Day 5-7', 'Seedlings come out'], ['Week 4', 'Weed and earth up'], ['Week 6-8', 'Pods form under soil'], ['Day 90-120', 'Ready to harvest']],
      store: 'Dry well. Store in clean sacks in a cool, dry place.',
      pests: 'Watch for leaf spot. Do not store damp nuts: they grow mould.',
      tip: 'Heap soil around the plant at 4 weeks so the pegs can enter the ground.',
      photos: ['Peanuts_0.jpg', 'Arachis_hypogaea_-_peanut.jpg', 'Groundnuts.jpg']
    },
    {
      id: 'gardenegg', search: 'African eggplant garden egg', name: 'Garden Egg', emoji: '🍆', grad: ['#e1bee7', '#8e24aa'],
      days: [75, 100], difficulty: 'Medium', badge: 'Local', seasons: ['rainy', 'dry'],
      depth: 1, seeds: '2', hole: 60, row: 75,
      water: 'Every morning in the nursery. Then every 2-3 days on the farm.',
      sun: 'Full sun.',
      soil: 'Well-drained loam with manure. pH 5.5-6.5.',
      best: 'Early rainy season, or dry season with watering.',
      avoid: 'Waterlogged soil.',
      steps: null, nurseryWeeks: 4,
      thin: 'Keep the strongest seedling in the nursery.',
      signs: ['Fruit is full size and shiny', 'Skin is smooth and firm', 'Pick before it becomes dull or soft'],
      harvestHow: ['Cut with a small knife. Keep the cap and stem.', 'Harvest every 4-5 days.', 'Handle gently. It bruises easily.'],
      stages: [['Day 0', 'Sow in nursery'], ['Week 4', 'Transplant'], ['Week 8', 'Flowers appear'], ['Week 10', 'Fruits form'], ['Day 75-100', 'Ready to pick']],
      store: 'Keep in a cool, shaded place. Lasts about a week.',
      pests: 'Watch for leaf eating beetles and fruit borers.',
      tip: 'Pick often. The plant will give more fruits.',
      photos: ['African_eggplant.jpg', 'Solanum_aethiopicum.jpg', 'Garden_eggs.jpg']
    }
  ];

  CROPS.forEach((c) => {
    if (!c.steps) c.steps = c.nurseryWeeks ? nurserySteps(c, c.nurseryWeeks) : defaultSteps(c);
  });

  /* ---------- Hand-drawn diagrams (SVG) ---------- */
  const INK = '#3a2a1c', SOIL = '#a9743f', LEAF = '#2f9e44', LEAF2 = '#69db7c';
  let uid = 0;

  const defs = (id) => `<defs>
    <filter id="r${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter>
    <marker id="a${id}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></marker>
  </defs>`;

  const text = (x, y, t, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-family="Caveat,'Comic Sans MS',cursive" font-size="${o.s || 19}" font-weight="700" fill="${o.c || INK}" stroke="${o.k || '#fffdf4'}" stroke-width="4" paint-order="stroke" stroke-linejoin="round" ${o.r ? `transform="rotate(${o.r} ${x} ${y})"` : ''}>${t}</text>`;

  const arrow = (id, x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" marker-start="url(#a${id})" marker-end="url(#a${id})"/>`;

  const seedling = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C0 -10 0 -14 0 -22" stroke="${LEAF}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M0 -14 C-13 -16 -17 -25 -15 -30 C-6 -30 0 -23 0 -14Z" fill="${LEAF}" stroke="${INK}" stroke-width="1.2"/><path d="M0 -19 C11 -21 16 -29 14 -34 C6 -33 0 -27 0 -19Z" fill="${LEAF2}" stroke="${INK}" stroke-width="1.2"/></g>`;

  function plant(x, b, h, c1, c2) {
    let s = `<path d="M${x} ${b} L${x} ${b - h}" stroke="${c1}" stroke-width="4.5" stroke-linecap="round"/>`;
    const n = Math.max(2, Math.round(h / 24));
    for (let i = 1; i <= n; i++) {
      const y = b - (h * i) / (n + 0.6), side = i % 2 ? 1 : -1, L = 13 + h / 7;
      s += `<path d="M${x} ${y} q ${side * L * 0.5} ${-L * 0.95} ${side * L} ${-L * 0.3} q ${-side * L * 0.3} ${L * 0.7} ${-side * L} ${L * 0.3}z" fill="${i % 2 ? c1 : c2}" stroke="${INK}" stroke-width="1.2"/>`;
    }
    return s;
  }

  function top(c) {
    const id = ++uid, W = 360, H = 270;
    const cols = [110, 210, 310], rows = [100, 165, 230];
    let g = `<rect x="8" y="8" width="344" height="254" rx="16" fill="#e9c791" stroke="${INK}" stroke-width="2.2" filter="url(#r${id})"/>`;
    for (let i = 0; i < 46; i++) g += `<circle cx="${20 + ((i * 53) % 320)}" cy="${22 + ((i * 37) % 236)}" r="1.6" fill="#b98a55"/>`;
    rows.forEach((y) => { g += `<line x1="70" y1="${y}" x2="345" y2="${y}" stroke="#b98a55" stroke-width="2" stroke-dasharray="6 6"/>`; });
    rows.forEach((y) => cols.forEach((x) => {
      g += `<ellipse cx="${x}" cy="${y}" rx="13" ry="9" fill="#5c3a1a" stroke="${INK}" stroke-width="1.5"/>` + seedling(x, y + 1, 0.62);
    }));
    g += arrow(id, cols[0], 62, cols[1], 62) + text((cols[0] + cols[1]) / 2, 50, `${c.hole} cm`, { s: 22 });
    g += arrow(id, 40, rows[0], 40, rows[1]) + text(50, (rows[0] + rows[1]) / 2 + 6, `${c.row} cm`, { s: 22, a: 'start' });
    g += text(26, 34, 'TOP VIEW', { a: 'start', s: 17, c: '#7a5326' });
    g += text(318, 262 - 10, 'rows →', { s: 16, c: '#7a5326' });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Top view of ${c.name} spacing">${defs(id)}<g>${g}</g></svg>`;
  }

  function side(c) {
    const id = ++uid, W = 360, H = 270, gy = 110;
    const d = Math.min(c.depth * 12, 125);
    let g = `<rect x="8" y="8" width="344" height="${gy - 8}" rx="16" fill="#d8f0ff"/>`;
    g += `<circle cx="305" cy="52" r="20" fill="#ffd43b" stroke="${INK}" stroke-width="2"/>`;
    for (let a = 0; a < 8; a++) { const r = (a * Math.PI) / 4; g += `<line x1="${305 + Math.cos(r) * 26}" y1="${52 + Math.sin(r) * 26}" x2="${305 + Math.cos(r) * 36}" y2="${52 + Math.sin(r) * 36}" stroke="#f08c00" stroke-width="3" stroke-linecap="round"/>`; }
    g += `<path d="M8 ${gy} H352 V246 a16 16 0 0 1 -16 16 H24 a16 16 0 0 1 -16 -16Z" fill="${SOIL}" stroke="${INK}" stroke-width="2.2" filter="url(#r${id})"/>`;
    for (let i = 0; i < 40; i++) g += `<circle cx="${20 + ((i * 47) % 320)}" cy="${gy + 12 + ((i * 29) % 130)}" r="${1.4 + (i % 3) * 0.6}" fill="#7a4f25"/>`;
    for (let x = 22; x < 345; x += 22) if (x < 138 || x > 222) g += `<path d="M${x} ${gy} q -3 -12 -6 -14 M${x} ${gy} q 1 -14 3 -17 M${x} ${gy} q 5 -9 9 -11" stroke="${LEAF}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M150 ${gy} V${gy + d} Q180 ${gy + d + 8} 210 ${gy + d} V${gy}Z" fill="#5c3a1a" stroke="${INK}" stroke-width="2"/>`;
    const n = Math.max(1, parseInt(c.seeds) || 1), by = gy + d - 8;
    for (let i = 0; i < n; i++) {
      const sx = 180 + (n === 1 ? 0 : (i - (n - 1) / 2) * 22);
      if (c.seedShape === 'stick') g += `<g transform="rotate(-25 ${sx} ${by})"><rect x="${sx - 22}" y="${by - 4}" width="44" height="8" rx="4" fill="#d9b382" stroke="${INK}" stroke-width="1.5"/><circle cx="${sx - 10}" cy="${by - 4}" r="2" fill="${LEAF}"/><circle cx="${sx + 8}" cy="${by - 4}" r="2" fill="${LEAF}"/></g>`;
      else if (c.seedShape === 'blob') g += `<ellipse cx="${sx}" cy="${by - 2}" rx="20" ry="12" fill="#e7c9a0" stroke="${INK}" stroke-width="1.6"/>`;
      else g += `<ellipse cx="${sx}" cy="${by}" rx="7" ry="5" fill="#f4d26b" stroke="${INK}" stroke-width="1.5"/>`;
    }
    g += arrow(id, 232, gy, 232, gy + d) + text(240, gy + d / 2 + 8, `${c.depth} cm`, { a: 'start', s: 24 });
    g += `<line x1="8" y1="${gy}" x2="146" y2="${gy}" stroke="${INK}" stroke-width="2" stroke-dasharray="7 6"/>`;
    g += text(28, 30, 'SIDE VIEW', { a: 'start', s: 17, c: '#2b6a8a' });
    g += text(78, gy - 22, 'ground', { s: 17 });
    g += `<path d="M120 ${gy + d + 2} Q95 ${gy + d - 6} 100 ${gy + d - 22}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" marker-end="url(#a${id})"/>` + text(78, gy + d + 24, c.seedShape ? 'cutting / piece' : 'seed', { s: 18 });
    g += text(180, 256, 'cover with loose soil', { s: 18, c: '#fff4de', k: '#5c3a1a' });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Side view of ${c.name} planting depth">${defs(id)}<g>${g}</g></svg>`;
  }

  function thin() {
    const id = ++uid, W = 360, H = 270;
    const panels = [10, 125, 240];
    let g = '';
    panels.forEach((x0, i) => {
      g += `<rect x="${x0}" y="12" width="110" height="246" rx="14" fill="${i === 2 ? '#e9f9dd' : '#fff6e3'}" stroke="${INK}" stroke-width="2" filter="url(#r${id})"/>`;
      g += `<path d="M${x0} 190 Q${x0 + 55} 174 ${x0 + 110} 190 V244 a14 14 0 0 1 -14 14 H${x0 + 14} a14 14 0 0 1 -14 -14Z" fill="${SOIL}" stroke="${INK}" stroke-width="2"/>`;
      g += `<circle cx="${x0 + 18}" cy="34" r="13" fill="${i === 2 ? '#2f9e44' : '#f08c00'}" stroke="${INK}" stroke-width="2"/>` + text(x0 + 18, 40, String(i + 1), { s: 18, c: '#fff', k: 'transparent' });
    });
    // 1: two seedlings
    g += plant(45, 182, 78, LEAF, LEAF2) + plant(74, 182, 44, '#8fbf6a', '#b7d99a');
    g += text(60, 226, '2 come up', { s: 15, c: '#fff4de', k: '#5c3a1a' });
    // 2: pull weak one
    g += plant(160, 182, 78, LEAF, LEAF2);
    g += `<g transform="translate(0 -34) rotate(18 196 160)">${plant(196, 182, 44, '#8fbf6a', '#b7d99a')}</g>`;
    g += `<path d="M212 118 q10 -22 -2 -42" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" marker-end="url(#a${id})"/>`;
    g += `<path d="M205 70 l14 14 M219 70 l-14 14" stroke="#e03131" stroke-width="4" stroke-linecap="round"/>`;
    g += text(180, 226, 'Pull weak', { s: 15, c: '#fff4de', k: '#5c3a1a' });
    // 3: one strong
    g += plant(295, 182, 100, LEAF, LEAF2);
    g += `<path d="M268 62 l7 8 l14 -16" fill="none" stroke="#2f9e44" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += text(295, 226, 'Keep 1', { s: 15, c: '#fff4de', k: '#5c3a1a' });
    g += text(180, 252, 'after about 2 weeks', { s: 14, c: '#fff4de', k: '#5c3a1a' });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Thinning weak plants">${defs(id)}<g>${g}</g></svg>`;
  }

  window.Diagrams = { top, side, thin };
})();
