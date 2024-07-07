import { Hono } from 'hono';
const authorsApp = new Hono()
	.get('/', (c) => c.json({ result: 'list authors' }))
	.post('/', (c) => c.json({ result: 'create an author' }, 201))
	.get('/:id', (c) => c.json({ result: `get ${c.req.param('id')}` }));

export default authorsApp;
