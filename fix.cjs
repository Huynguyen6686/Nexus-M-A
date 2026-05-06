const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const startTag = '<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">';
const endTag = '<div className="flex items-center justify-between">';

const start = code.indexOf(startTag);
if (start !== -1) {
    const end = code.indexOf(endTag, start);
    if (end !== -1) {
        const target = code.substring(start, end + endTag.length);
        const replace = `<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deal Management Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">`;
        code = code.replace(target, replace);
        fs.writeFileSync('src/pages/Dashboard.tsx', code);
        console.log("Fixed syntax error");
    }
}
