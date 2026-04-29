
const fs = require('fs');
const files = [
  'frontend/src/pages/TeacherPortal.jsx',
  'frontend/src/pages/StudentPortal.jsx',
  'frontend/src/pages/LibrarianPortal.jsx',
  'frontend/src/pages/AdminPortal.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\{t\.book\?\.imageUrl \&\& \(\.endsWith\('\.pdf'\) \|\| \.includes\('application\/pdf'\)\)/g, '{t.book?.imageUrl && (t.book.imageUrl.endsWith(\'.pdf\') || t.book.imageUrl.includes(\'application/pdf\'))');
  content = content.replace(/\{book\.imageUrl \&\& \(\.endsWith\('\.pdf'\) \|\| \.includes\('application\/pdf'\)\)/g, '{book.imageUrl && (book.imageUrl.endsWith(\'.pdf\') || book.imageUrl.includes(\'application/pdf\'))');
  content = content.replace(/formData\.imageUrl \&\& \(\.endsWith\('\.pdf'\) \|\| \.includes\('application\/pdf'\)\)/g, 'formData.imageUrl && (formData.imageUrl.endsWith(\'.pdf\') || formData.imageUrl.includes(\'application/pdf\'))');
  content = content.replace(/formData\.imageUrl\s*\n*\s*\(\.endsWith\('\.pdf'\) \|\| \.includes\('application\/pdf'\)\)/g, 'formData.imageUrl && (formData.imageUrl.endsWith(\'.pdf\') || formData.imageUrl.includes(\'application/pdf\'))');
  
  // Actually, wait, look at the grep output:
  // \ormData.imageUrl.endsWith('.pdf') ? (\ was replaced to \(.endsWith('.pdf') || .includes('application/pdf')) ? (\
  // meaning formData.imageUrl was lost!
  content = content.replace(/\(\.endsWith\('\.pdf'\) \|\| \.includes\('application\/pdf'\)\)/g, '(formData.imageUrl.endsWith(\'.pdf\') || formData.imageUrl.includes(\'application/pdf\'))');
  
  fs.writeFileSync(file, content);
});

