import { Hono } from 'hono'
import bilidown from './routes/bilidown'
import dydown from './routes/dydown'
import frankfurter from './routes/frankfurter'
import getmcpe from './routes/getmcpe'
import hhsh from './routes/hhsh'
import lyric from './routes/lyric'
import weather from './routes/weather'

const app = new Hono().basePath('/api')

app.route('/bilidown', bilidown)
app.route('/dydown', dydown)
app.route('/frankfurter', frankfurter)
app.route('/getmcpe', getmcpe)
app.route('/hhsh', hhsh)
app.route('/lyric', lyric)
app.route('/weather', weather)

export default app
