import * as siteContent from '@/content/siteContent';

test('lists the two personal projects in order', () => {
  expect(siteContent.projectList.map(project => project.slug)).toEqual(['jobscout', 'skin-care-ai']);
  expect(siteContent.projectList[0].githubUrl).toBe('https://github.com/pranoww/jobscout');
});

test('room objects follow the dot order', () => {
  expect(siteContent.roomObjectList.map(roomObject => roomObject.label)).toEqual(['Based in', 'Day job', 'Learning now', 'Studied', 'Weekends', 'Cat bed']);
});

test('the cat name only appears in the rare name lines and his own chat', () => {
  const { grayCatLines, simbhaChat, ...everythingElse } = siteContent;
  expect(simbhaChat.title).toMatch(/Simbha/);
  const { name: nameLines, ...otherLines } = grayCatLines;
  expect(JSON.stringify(everythingElse)).not.toMatch(/Simbha/);
  expect(JSON.stringify(otherLines)).not.toMatch(/Simbha/);
  expect(nameLines.join(' ')).toMatch(/Simbha/);
});

test('contact details and links', () => {
  expect(siteContent.profile.email).toBe('pranavlande555@gmail.com');
  expect(siteContent.profile.githubUrl).toBe('https://github.com/pranoww');
  expect(siteContent.profile.linkedinUrl).toBe('https://www.linkedin.com/in/pranavlande');
  expect(siteContent.profile.resumePath).toBe('/resume/Pranav_Kishor_Lande_Resume.pdf');
});

test('skills live in the "What I build" stack lines instead of a separate grid', () => {
  const allStackLines = siteContent.buildItemList.map(buildItem => buildItem.stackLine).join(' · ');
  ['Next.js', 'React', 'Tailwind CSS', 'Node.js', 'Python', 'FastAPI', 'Flask', 'SQLAlchemy', 'Pydantic', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker', 'RAG', 'LangChain', 'LangGraph', 'Vector databases', 'Lighthouse', 'Core Web Vitals', 'SEO', 'Datadog']
    .forEach(skill => expect(allStackLines).toContain(skill));
  expect(siteContent.skillGroupList).toBeUndefined();
});
