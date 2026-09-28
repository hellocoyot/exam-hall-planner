/* Demo data: 240 Plus One / Plus Two students for one exam session, and 6 halls.
 * Economics is written by both Commerce and Humanities — the engine treats it as one paper.
 */
(function (root) {
  const first = ['Aparna','Muhammed','Sneha','Arjun','Fathima','Adithya','Anjali','Rahul','Nandana','Abhinav',
    'Devika','Mohammed','Gopika','Vishnu','Ayesha','Sreehari','Athira','Nihal','Meera','Akhil','Hiba','Sidharth',
    'Keerthana','Amal','Riya','Aswin','Shifana','Gokul','Lakshmi','Jithin','Nimisha','Fahad','Parvathy','Ananthu',
    'Safa','Kiran','Diya','Midhun','Haritha','Sanjay','Aleena','Ajmal','Anagha','Harikrishnan','Nadia','Jerin',
    'Theertha','Basil','Sreelakshmi','Rohan'];
  const last = ['Menon','K P','Nair','T K','Pillai','M S','Varghese','P A','Kurian','Rajan','Thomas','V R','Joseph',
    'Babu','Krishnan','C K','Abraham','N S','George','Hameed','Mathew','Suresh','A K','Das','Namboothiri'];

  // Class -> subject(s) they write in this session. Numbers are head-counts.
  const plan = [
    { cls: 'Plus One Science A',    stream: 'Science',    base: 1501, papers: [['Physics', 40]] },
    { cls: 'Plus One Commerce A',   stream: 'Commerce',   base: 1502, papers: [['Accountancy', 40]] },
    { cls: 'Plus One Humanities A', stream: 'Humanities', base: 1503, papers: [['History', 40]] },
    { cls: 'Plus Two Science A',    stream: 'Science',    base: 2501, papers: [['Biology', 22], ['Computer Science', 18]] },
    { cls: 'Plus Two Commerce A',   stream: 'Commerce',   base: 2502, papers: [['Economics', 40]] },
    { cls: 'Plus Two Humanities A', stream: 'Humanities', base: 2503, papers: [['Economics', 40]] }
  ];

  const students = [];
  let n = 0;
  for (const p of plan) {
    let i = 1;
    for (const [subject, count] of p.papers) {
      for (let k = 0; k < count; k++, i++, n++) {
        students.push({
          reg: String(p.base) + String(i).padStart(3, '0'),
          name: first[(n * 7) % first.length] + ' ' + last[(n * 11 + 3) % last.length],
          cls: p.cls,
          stream: p.stream,
          subject
        });
      }
    }
  }

  const halls = [
    { name: 'Hall 1',      rows: 8, benches: 3, perBench: 2 },
    { name: 'Hall 2',      rows: 8, benches: 3, perBench: 2 },
    { name: 'Hall 3',      rows: 8, benches: 3, perBench: 2 },
    { name: 'Room 12',     rows: 7, benches: 3, perBench: 2 },
    { name: 'Room 14',     rows: 7, benches: 3, perBench: 2 },
    { name: 'Science Lab', rows: 6, benches: 4, perBench: 2 }
  ];

  const api = { students, halls };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DemoData = api;
})(this);
