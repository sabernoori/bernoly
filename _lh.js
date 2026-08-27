const fs = require("fs");
const css = fs.readFileSync(process.env.TEMP + "\\wf.css", "utf8");
for (const k of ["h3{", "process_heading{", "body{", "line-height"]) {
  let i = 0;
  let n = 0;
  while ((i = css.indexOf(k, i)) !== -1 && n < 8) {
    if (k !== "line-height" || /h3|heading|body/.test(css.slice(Math.max(0, i - 40), i + 80))) {
      console.log(css.slice(Math.max(0, i - 30), i + 120).replace(/\s+/g, " "));
      console.log("---");
      n++;
    }
    i += k.length;
  }
}
