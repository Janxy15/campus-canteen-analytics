import {useEffect,useMemo,useState} from 'react'
import {Activity,BarChart3,Database,Gauge,LayoutDashboard,Menu,RefreshCw,Search,Star,Store,Utensils,Users,X,Plus,TrendingUp,Clock,MessageSquare,Receipt} from 'lucide-react'
import {Bar,BarChart,CartesianGrid,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts'

const API='http://localhost:8080/api'
const money=v=>'₹'+Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:0})
const today=new Date().toISOString().slice(0,10)

function App(){
 const [page,setPage]=useState('dashboard'),[d,setD]=useState({}),[online,setOnline]=useState(false),[loading,setLoading]=useState(true),[open,setOpen]=useState(false)
 async function load(){
  setLoading(true)
  try{
   const paths={summary:'dashboard/summary',top:'analytics/top-items',hours:'analytics/peak-hours',canteens:'analytics/canteen-performance',ratings:'analytics/rating-performance',daily:'analytics/daily-sales'}
   const out={}
   for(const [k,p] of Object.entries(paths)){const r=await fetch(API+'/'+p);if(!r.ok)throw Error();out[k]=await r.json()}
   const h=await fetch(API+'/health');setOnline(h.ok);setD(out)
  }catch(e){setOnline(false)}finally{setLoading(false)}
 }
 useEffect(()=>{load()},[])
 const nav=[['dashboard','Overview',LayoutDashboard],['owner','Owner Insights',TrendingUp],['analytics','Analytics',BarChart3],['database','Database',Database]]
 return <div className="app">
  <aside className={'side '+(open?'open':'')}>
   <div className="brand"><div className="brandIcon"><Utensils size={18}/></div><div><b>CampusIQ</b><small>Canteen Analytics</small></div></div>
   <div className="label">WORKSPACE</div>
   {nav.map(([id,name,Icon])=><button key={id} className={page===id?'nav active':'nav'} onClick={()=>{setPage(id);setOpen(false)}}><Icon size={17}/>{name}</button>)}
   <div className="sideBottom"><div className="dbState"><span className={'dot '+(online?'on':'')}></span>{online?'Database connected':'Database offline'}<small>Spring Boot · MySQL</small></div><small>DBMS Project · 2026</small></div>
  </aside>
  <main className="main">
   <header><button className="mobile" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><div><span className="eyebrow">CAMPUS OPERATIONS</span><h1>{page==='dashboard'?'Canteen Overview':page==='owner'?'Owner Insights':page==='analytics'?'Analytics':'Database Explorer'}</h1></div><div className="headRight"><span className="live"><i className={'dot '+(online?'on':'')}></i>{online?'Live':'Offline'}</span><button className="refresh" onClick={load}><RefreshCw size={15}/> Refresh</button></div></header>
   {page==='dashboard'&&<Dashboard d={d} loading={loading}/>} 
   {page==='owner'&&<OwnerInsights/>}
   {page==='analytics'&&<Analytics d={d}/>}
   {page==='database'&&<DatabaseView/>}
  </main>
 </div>
}

function Dashboard({d,loading}){
 if(loading&&!d.summary)return <Loading/>
 const s=d.summary||{}, cards=[['Canteens',s.canteens,Store],['Food Items',s.items,Utensils],['Units Sold',s.unitsSold,Activity],['Revenue',money(s.revenue),Gauge],['Customers',s.customers,Users],['Avg Rating',Number(s.averageRating||0).toFixed(1),Star]]
 return <section className="content">
  <div className="hero"><div><span>DATABASE-DRIVEN INSIGHT</span><h2>Understand demand.<br/><em>Improve decisions.</em></h2><p>Sales, timing and customer feedback brought together through a structured relational model.</p></div><div className="orb"><Database size={42}/></div></div>
  <div className="cards">{cards.map(([l,v,I])=><div className="card" key={l}><div className="cardIcon"><I size={17}/></div><small>{l}</small><strong>{v??'—'}</strong></div>)}</div>
  <Section n="01" title="Demand overview" sub="Where activity is concentrated"/>
  <div className="grid2"><Panel title="Daily sales" sub="Units sold by date"><ResponsiveContainer width="100%" height={250}><LineChart data={d.daily||[]}><CartesianGrid vertical={false} strokeDasharray="3 3"/><XAxis dataKey="saleDate" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip/><Line type="monotone" dataKey="unitsSold" stroke="currentColor" strokeWidth={3}/></LineChart></ResponsiveContainer></Panel><Panel title="Peak demand" sub="Sales volume by hour"><ResponsiveContainer width="100%" height={250}><BarChart data={d.hours||[]}><CartesianGrid vertical={false} strokeDasharray="3 3"/><XAxis dataKey="hour" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip/><Bar dataKey="unitsSold" fill="currentColor" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></Panel></div>
  <Section n="02" title="Performance" sub="Sales and satisfaction together"/>
  <div className="grid2"><Panel title="Top food items" sub="Ranked by total units sold"><div className="rank">{(d.top||[]).slice(0,6).map((x,i)=><div className="rankRow" key={x.item}><span>{String(i+1).padStart(2,'0')}</span><div><b>{x.item}</b><small>{x.canteen}</small></div><strong>{x.unitsSold}<small> units</small></strong></div>)}</div></Panel><Panel title="Canteen performance" sub="Revenue comparison">{(d.canteens||[]).map(x=><div className="canteen" key={x.canteen}><div><b>{x.canteen}</b><small>{x.unitsSold} units · {x.averageRating} ★</small></div><strong>{money(x.revenue)}</strong></div>)}</Panel></div>
 </section>
}

function OwnerInsights(){
 const [items,setItems]=useState([]),[customers,setCustomers]=useState([]),[query,setQuery]=useState('Tea'),[selected,setSelected]=useState('Tea'),[insight,setInsight]=useState(null),[loading,setLoading]=useState(false),[message,setMessage]=useState(''),[saleForm,setSaleForm]=useState({itemId:'',saleDate:today,saleTime:'13:00',quantity:1,unitPrice:''}),[ratingForm,setRatingForm]=useState({itemId:'',customerId:'',rating:5,reviewText:'',ratingDate:today}),[saving,setSaving]=useState(false)
 useEffect(()=>{Promise.all([fetch(API+'/items').then(r=>r.json()),fetch(API+'/customers').then(r=>r.json())]).then(([i,c])=>{setItems(i);setCustomers(c);if(i.length){const tea=i.find(x=>x.name.toLowerCase()==='tea');const first=tea||i[0];setSaleForm(f=>({...f,itemId:String(first.id),unitPrice:first.price}));setRatingForm(f=>({...f,itemId:String(first.id)}))}}).catch(()=>{})},[])
 async function searchItem(name=selected){
  if(!name.trim())return
  setLoading(true);setMessage('')
  try{const r=await fetch(API+'/analytics/item-insights?item='+encodeURIComponent(name.trim()));if(!r.ok)throw Error();const data=await r.json();setInsight(data);setSelected(data.item||name.trim())}catch{setInsight(null);setMessage('No matching item found. Try another food item name.')}finally{setLoading(false)}
 }
 const matching=useMemo(()=>items.filter(x=>x.name.toLowerCase().includes(query.toLowerCase())).slice(0,6),[items,query])
 function chooseItem(item){setQuery(item.name);setSelected(item.name);setSaleForm(f=>({...f,itemId:String(item.id),unitPrice:item.price}));setRatingForm(f=>({...f,itemId:String(item.id)}));searchItem(item.name)}
 async function recordSale(e){e.preventDefault();setSaving(true);setMessage('');try{const r=await fetch(API+'/sales',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({item:{id:Number(saleForm.itemId)},saleDate:saleForm.saleDate,saleTime:saleForm.saleTime+':00',quantity:Number(saleForm.quantity),unitPrice:Number(saleForm.unitPrice)})});if(!r.ok)throw Error();setMessage('Sale recorded successfully. Refreshing item insight…');await searchItem(selected)}catch{setMessage('Could not record the sale. Check the selected item and values.')}finally{setSaving(false)}}
 async function recordRating(e){e.preventDefault();setSaving(true);setMessage('');try{const r=await fetch(API+'/ratings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({item:{id:Number(ratingForm.itemId)},customer:{id:Number(ratingForm.customerId)},rating:Number(ratingForm.rating),reviewText:ratingForm.reviewText,ratingDate:ratingForm.ratingDate})});if(!r.ok)throw Error();setMessage('Rating recorded successfully. Refreshing item insight…');await searchItem(selected)}catch{setMessage('Could not record the rating. Make sure a customer is selected.')}finally{setSaving(false)}}
 const item=insight
 return <section className="content">
  <div className="ownerHero"><div><span>OWNER WORKSPACE</span><h2>Ask the database about any item.</h2><p>Search a food item and get its sales, revenue, demand timing, ratings, reviews and transaction history from MySQL.</p></div><div className="searchBox"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')searchItem()}} placeholder="Search food item…"/><button onClick={()=>searchItem()}>Analyze</button>{query&&matching.length>0&&<div className="suggestions">{matching.map(x=><button key={x.id} onClick={()=>chooseItem(x)}>{x.name}<small>{x.category} · {money(x.price)}</small></button>)}</div>}</div></div>
  {message&&<div className="notice">{message}</div>}
  {loading?<Loading small/>:item?<ItemInsight data={item}/>:<div className="emptyState"><Search size={26}/><h3>Search for an item</h3><p>Try <b>Tea</b>, <b>Chicken Biryani</b>, <b>Cold Coffee</b> or any item currently in your database.</p></div>}
  <div className="ownerForms">
   <Panel title="Record a sale" sub="Write a new transaction into MySQL"><form className="formGrid" onSubmit={recordSale}><Field label="Food item"><select value={saleForm.itemId} onChange={e=>{const it=items.find(x=>String(x.id)===e.target.value);setSaleForm({...saleForm,itemId:e.target.value,unitPrice:it?.price||''});if(it){setQuery(it.name);setSelected(it.name)}}}>{items.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Date"><input type="date" value={saleForm.saleDate} onChange={e=>setSaleForm({...saleForm,saleDate:e.target.value})}/></Field><Field label="Time"><input type="time" value={saleForm.saleTime} onChange={e=>setSaleForm({...saleForm,saleTime:e.target.value})}/></Field><Field label="Quantity"><input type="number" min="1" value={saleForm.quantity} onChange={e=>setSaleForm({...saleForm,quantity:e.target.value})}/></Field><Field label="Unit price"><input type="number" step="0.01" min="0" value={saleForm.unitPrice} onChange={e=>setSaleForm({...saleForm,unitPrice:e.target.value})}/></Field><button className="primaryAction" disabled={saving}><Plus size={15}/>{saving?'Saving…':'Record sale'}</button></form></Panel>
   <Panel title="Add customer feedback" sub="Store a rating and review"><form className="formGrid" onSubmit={recordRating}><Field label="Food item"><select value={ratingForm.itemId} onChange={e=>setRatingForm({...ratingForm,itemId:e.target.value})}>{items.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Customer"><select required value={ratingForm.customerId} onChange={e=>setRatingForm({...ratingForm,customerId:e.target.value})}><option value="">Select customer</option>{customers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Rating"><select value={ratingForm.rating} onChange={e=>setRatingForm({...ratingForm,rating:e.target.value})}><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Poor</option><option value="1">1 — Bad</option></select></Field><Field label="Date"><input type="date" value={ratingForm.ratingDate} onChange={e=>setRatingForm({...ratingForm,ratingDate:e.target.value})}/></Field><label className="field full"><span>Review</span><textarea rows="2" value={ratingForm.reviewText} onChange={e=>setRatingForm({...ratingForm,reviewText:e.target.value})} placeholder="Optional customer comment"/></label><button className="primaryAction" disabled={saving}><Star size={15}/>{saving?'Saving…':'Add rating'}</button></form></Panel>
  </div>
 </section>
}

function ItemInsight({data}){const s=data.summary||{},daily=data.dailySales||[],hours=data.hourlyDemand||[];return <div>
 <div className="itemHeader"><div><span>ITEM PROFILE</span><h2>{data.item}</h2><p>{data.category} · {data.canteen} · {data.location} · {data.available?'Available':'Currently unavailable'}</p></div><div className="itemPrice">{money(data.price)}<small>current price</small></div></div>
 <div className="cards insightCards">{[['Units sold',s.unitsSold,Activity],['Revenue',money(s.revenue),Gauge],['Avg rating',Number(s.averageRating||0).toFixed(1),Star],['Ratings',s.ratingCount,MessageSquare],['Transactions',s.transactionCount,Receipt],['Last sale',s.lastSaleDate||'—',Clock]].map(([l,v,I])=><div className="card" key={l}><div className="cardIcon"><I size={17}/></div><small>{l}</small><strong>{v}</strong></div>)}</div>
 <div className="grid2"><Panel title="Sales trend" sub="Daily units and revenue"><ResponsiveContainer width="100%" height={270}><LineChart data={daily}><CartesianGrid vertical={false} strokeDasharray="3 3"/><XAxis dataKey="saleDate" tick={{fontSize:10}}/><YAxis yAxisId="left" tick={{fontSize:10}}/><YAxis yAxisId="right" orientation="right" tick={{fontSize:10}}/><Tooltip/><Line yAxisId="left" type="monotone" dataKey="unitsSold" stroke="currentColor" strokeWidth={3}/><Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#888" strokeWidth={2}/></LineChart></ResponsiveContainer></Panel><Panel title="Demand by hour" sub="When customers buy this item"><ResponsiveContainer width="100%" height={270}><BarChart data={hours}><CartesianGrid vertical={false} strokeDasharray="3 3"/><XAxis dataKey="hour" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip/><Bar dataKey="unitsSold" fill="currentColor" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></Panel></div>
 <div className="grid2"><Panel title="Recent transactions" sub="Actual sale rows for this item"><Table rows={data.recentSales||[]} cols={['saleDate','saleTime','quantity','unitPrice','revenue']}/></Panel><Panel title="Customer feedback" sub="Ratings and review text"><div className="reviewList">{(data.reviews||[]).length?(data.reviews||[]).map((r,i)=><div className="review" key={i}><div><b>{r.customer}</b><span>{Number(r.rating).toFixed(1)} ★</span></div><p>{r.reviewText||'No written review.'}</p><small>{r.ratingDate}</small></div>):<div className="empty">No ratings yet.</div>}</div></Panel></div>
 </div>}

function Analytics({d}){return <section className="content"><div className="intro"><div><span>SQL ANALYTICS</span><h2>From relational data to insight.</h2></div><p>Visualizations are backed by SQL aggregation, joins, views and grouped analysis.</p></div><div className="grid2"><Panel title="Top items" sub="SUM(quantity) + GROUP BY"><ResponsiveContainer width="100%" height={290}><BarChart data={d.top||[]} layout="vertical"><CartesianGrid horizontal={false}/><XAxis type="number" tick={{fontSize:10}}/><YAxis type="category" dataKey="item" width={105} tick={{fontSize:10}}/><Tooltip/><Bar dataKey="unitsSold" fill="currentColor" radius={[0,5,5,0]}/></BarChart></ResponsiveContainer></Panel><Panel title="Revenue trend" sub="SUM(quantity × unit_price)"><ResponsiveContainer width="100%" height={290}><LineChart data={d.daily||[]}><CartesianGrid vertical={false}/><XAxis dataKey="saleDate" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip formatter={v=>money(v)}/><Line type="monotone" dataKey="revenue" stroke="currentColor" strokeWidth={3}/></LineChart></ResponsiveContainer></Panel></div><div className="grid2"><Panel title="Sales vs satisfaction" sub="Popularity and ratings"><Table rows={d.ratings||[]} cols={['item','unitsSold','averageRating']}/></Panel><Panel title="Canteen comparison" sub="JOIN + GROUP BY"><Table rows={d.canteens||[]} cols={['canteen','unitsSold','revenue']}/></Panel></div></section>}

function DatabaseView(){const [tab,setTab]=useState('tables'),[rows,setRows]=useState([]),[loading,setLoading]=useState(false);const tabs=[['tables','Tables'],['canteens','Canteens'],['items','Food Items'],['customers','Customers'],['sales','Sales'],['ratings','Ratings']];async function load(p){setLoading(true);try{const r=await fetch(API+'/'+p);setRows(await r.json())}catch{setRows([])}finally{setLoading(false)}}useEffect(()=>{tab==='tables'?setRows([]):load(tab)},[tab]);return <section className="content"><div className="intro"><div><span>RELATIONAL MODEL</span><h2>Database Explorer</h2></div><p>Core entities connected through primary and foreign keys.</p></div><div className="tabs">{tabs.map(([id,n])=><button className={tab===id?'sel':''} onClick={()=>setTab(id)} key={id}>{n}</button>)}</div>{tab==='tables'?<div className="entities">{[['Canteen','canteen_id','name · location · opening_time · closing_time'],['Food_Item','item_id','name · category · price · canteen_id'],['Sale','sale_id','item_id · sale_date · sale_time · quantity'],['Customer','customer_id','name · student_type · department'],['Rating','rating_id','item_id · customer_id · rating']].map(x=><div className="entity" key={x[0]}><small>RELATION</small><h3>{x[0]}</h3><code>PK · {x[1]}</code><p>{x[2]}</p></div>)}</div>:<Panel title={tab+' records'} sub="Live data from Spring Boot + MySQL">{loading?<Loading small/>:<Table rows={rows} cols={rows[0]?Object.keys(rows[0]).filter(k=>typeof rows[0][k]!=='object').slice(0,7):[]}/>}</Panel>}</section>}

function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Table({rows,cols}){if(!rows.length)return <div className="empty">No records found.</div>;return <div className="table"><table><thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.slice(0,25).map((r,i)=><tr key={i}>{cols.map(c=><td key={c}>{String(r[c]??'—')}</td>)}</tr>)}</tbody></table></div>}
function Panel({title,sub,children}){return <div className="panel"><div className="panelHead"><div><h3>{title}</h3><small>{sub}</small></div></div>{children}</div>}
function Section({n,title,sub}){return <div className="section"><div><i>{n}</i><h3>{title}</h3></div><small>{sub}</small></div>}
function Loading({small=false}){return <div className={'loading '+(small?'small':'')}><RefreshCw className="spin"/><span>Loading data…</span></div>}

export default App