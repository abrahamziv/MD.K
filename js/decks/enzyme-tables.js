/* Decks: Lehninger 8th ed., Chapter 6 (Enzymes) tables 6-1, 6-2, 6-3. Entered exactly as printed.
   type 'table': one item per row; a cell is a string, or an array when the row lists several values.
   Text markup: ^superscript^  _subscript_ */
MDK.registerDeck({
  id: 'enzyme-ions', subject: 'biochem', type: 'table',
  title: 'טבלה 6-1: יונים כקופקטורים', subtitle: 'יונים אנאורגניים שהם קופקטורים לאנזימים',
  source: 'Lehninger, Principles of Biochemistry, 8th ed. — Table 6-1',
  cols: [{ id: 'ion', label: 'Ions' }, { id: 'enz', label: 'Enzymes' }],
  items: [
    { id: 'cu',  cells: { ion: 'Cu^2+^', enz: ['Cytochrome oxidase'] } },
    { id: 'fe',  cells: { ion: 'Fe^2+^ or Fe^3+^', enz: ['Cytochrome oxidase', 'Catalase', 'Peroxidase'] } },
    { id: 'k',   cells: { ion: 'K^+^', enz: ['Pyruvate kinase'] } },
    { id: 'mg',  cells: { ion: 'Mg^2+^', enz: ['Hexokinase', 'Glucose 6-phosphatase', 'Pyruvate kinase'] } },
    { id: 'mn',  cells: { ion: 'Mn^2+^', enz: ['Arginase', 'Ribonucleotide reductase'] } },
    { id: 'mo',  cells: { ion: 'Mo', enz: ['Dinitrogenase'] } },
    { id: 'ni',  cells: { ion: 'Ni^2+^', enz: ['Urease'] } },
    { id: 'zn',  cells: { ion: 'Zn^2+^', enz: ['Carbonic anhydrase', 'Alcohol dehydrogenase', 'Carboxypeptidases A and B'] } }
  ]
});

MDK.registerDeck({
  id: 'coenzymes', subject: 'biochem', type: 'table',
  title: 'טבלה 6-2: קואנזימים', subtitle: 'נשאים זמניים של אטומים או קבוצות פונקציונליות',
  source: 'Lehninger, Principles of Biochemistry, 8th ed. — Table 6-2',
  cols: [{ id: 'co', label: 'Coenzyme' }, { id: 'grp', label: 'Examples of chemical groups transferred' }, { id: 'diet', label: 'Dietary precursor in mammals' }],
  items: [
    { id: 'biocytin', cells: { co: 'Biocytin', grp: 'CO_2_', diet: 'Biotin (vitamin B_7_)' } },
    { id: 'coa',      cells: { co: 'Coenzyme A', grp: 'Acyl groups', diet: 'Pantothenic acid (vitamin B_5_) and other compounds' } },
    { id: 'b12',      cells: { co: '5′-Deoxyadenosylcobalamin (coenzyme B_12_)', grp: 'H atoms and alkyl groups', diet: 'Vitamin B_12_' } },
    { id: 'fad',      cells: { co: 'Flavin adenine dinucleotide', grp: 'Electrons', diet: 'Riboflavin (vitamin B_2_)' } },
    { id: 'lipoate',  cells: { co: 'Lipoate', grp: 'Electrons and acyl groups', diet: 'Not required in diet' } },
    { id: 'nad',      cells: { co: 'Nicotinamide adenine dinucleotide', grp: 'Hydride ion (:H^−^)', diet: 'Nicotinic acid (niacin, vitamin B_3_)' } },
    { id: 'plp',      cells: { co: 'Pyridoxal phosphate', grp: 'Amino groups', diet: 'Pyridoxine (vitamin B_6_)' } },
    { id: 'thf',      cells: { co: 'Tetrahydrofolate', grp: 'One-carbon groups', diet: 'Folate (vitamin B_9_)' } },
    { id: 'tpp',      cells: { co: 'Thiamine pyrophosphate', grp: 'Aldehydes', diet: 'Thiamine (vitamin B_1_)' } }
  ]
});

MDK.registerDeck({
  id: 'enzyme-classes', subject: 'biochem', type: 'table',
  title: 'טבלה 6-3: סיווג אנזימים', subtitle: 'International Classification of Enzymes',
  source: 'Lehninger, Principles of Biochemistry, 8th ed. — Table 6-3',
  cols: [{ id: 'no', label: 'Class number' }, { id: 'name', label: 'Class name' }, { id: 'rx', label: 'Type of reaction catalyzed' }],
  items: [
    { id: 'c1', cells: { no: '1', name: 'Oxidoreductases', rx: 'Transfer of electrons (hydride ions or H atoms)' } },
    { id: 'c2', cells: { no: '2', name: 'Transferases', rx: 'Group transfer' } },
    { id: 'c3', cells: { no: '3', name: 'Hydrolases', rx: 'Hydrolysis (transfer of functional groups to water)' } },
    { id: 'c4', cells: { no: '4', name: 'Lyases', rx: 'Cleavage of C—C, C—O, C—N, or other bonds by elimination, leaving double bonds or rings, or addition of groups to double bonds' } },
    { id: 'c5', cells: { no: '5', name: 'Isomerases', rx: 'Transfer of groups within molecules to yield isomeric forms' } },
    { id: 'c6', cells: { no: '6', name: 'Ligases', rx: 'Formation of C—C, C—S, C—O, and C—N bonds by condensation reactions coupled to cleavage of ATP or similar cofactor' } },
    { id: 'c7', cells: { no: '7', name: 'Translocases', rx: 'Movement of molecules or ions across membranes or their separation within membranes' } }
  ]
});
