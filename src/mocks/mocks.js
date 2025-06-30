import img from "../assets/cursor-cross.svg";

const blocksq = [
  {
    id: 1,
    ml_id: Math.floor(Math.random() * 1000),
    type: "img",
    content: `<img src="${img}" alt="123">`,
  },
  {
    id: 2,
    ml_id: Math.floor(Math.random() * 1000),
    type: "img",
    content: `<img src="https://plus.unsplash.com/premium_photo-1664303228186-a61e7dc91597?q=80&w=692&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="123">`,
  },

  {
    id: 3,
    ml_id: Math.floor(Math.random() * 1000),
    type: "p",
    content: "<p>test test test</p>",
  },
  {
    id: 4,
    ml_id: Math.floor(Math.random() * 1000),
    type: "h",
    content: "<h1>test H</h1>",
  },
  {
    id: 5,
    ml_id: Math.floor(Math.random() * 1000),
    type: "table",
    content:
      "<table><tr><td>1</td><td>2</td><td>Длинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фраза</td></tr><tr><td>4</td><td>Длинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фразаДлинная фраза</td><td>6</td></tr><tr><td>7</td><td>8</td><td>9</td></tr></table>",
  },
  {
    id: 6,
    ml_id: Math.floor(Math.random() * 1000),
    type: "ul",
    content: "<ul><li>test1</li><li>test2</li></ul>",
  },
  {
    id: 7,
    ml_id: Math.floor(Math.random() * 1000),
    type: "icon",
    content: "textIcon",
  },
  {
    id: 8,
    ml_id: Math.floor(Math.random() * 1000),
    type: "fx",
    content: "textFX",
  },
  {
    id: 9,
    ml_id: Math.floor(Math.random() * 1000),
    type: "link",
    content: `<a href="https://google.com" target="_blank">Текст ссылки</a>`,
  },
  {
    id: 10,
    ml_id: Math.floor(Math.random() * 1000),
    type: "ol",
    content: "<ol><li>test1</li><li>test2</li></ol>",
  },
];

export { blocksq };
