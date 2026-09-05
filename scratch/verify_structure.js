const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('Includes <footer:', html.includes('<footer'));
console.log('Includes base-footer-hud:', html.includes('base-footer-hud'));
console.log('Includes receiptSection:', html.includes('receiptSection'));
console.log('Includes 05 RECEIPT:', html.includes('05 RECEIPT'));
console.log('Includes ENTERPRISE SDK:', html.includes('ENTERPRISE SDK'));
console.log('Includes // at nav:', html.includes('// 0'));

const sectionMatches = [];
const regex = /<section[^>]*id=["']([^"']+)["']/g;
let m;
while ((m = regex.exec(html)) !== null) {
  sectionMatches.push(m[1]);
}
console.log('Sections present in order:', sectionMatches);

const lastSectionIdx = html.lastIndexOf('</section>');
const afterLastSection = html.slice(lastSectionIdx + '</section>'.length);
console.log('\n--- Content between last </section> and <script> ---');
const scriptIdx = afterLastSection.indexOf('<script>');
console.log(afterLastSection.slice(0, scriptIdx).trim());
