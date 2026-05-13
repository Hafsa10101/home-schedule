import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, set, push, remove, update } from "firebase/database";
import { daily, weekly, monthly, whoConfig } from "./data";

// ─── Helpers ─────────────────────────────────────────────────

const getTodayStr = () => new Date().toISOString().split("T")[0];
const getDayIndex = () => new Date().getDay();
const getWeekOfMonth = () => {
  const d = new Date().getDate();
  return d <= 7 ? 1 : d <= 14 ? 2 : d <= 21 ? 3 : 4;
};
const DAYS_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const formatDate = () => {
  const d = new Date();
  return `${DAYS_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

// ─── Design tokens ───────────────────────────────────────────

const C = {
  cream: "#FDF7EF",
  tan: "#F0E8DB",
  border: "#E8DDD0",
  terracotta: "#C4704A",
  darkTerra: "#6B3A2A",
  brown: "#3D2B1F",
  muted: "#9A7A60",
  green: "#6AAE7C",
};

const headerGrad = `linear-gradient(135deg, #6B3A2A 0%, #A0522D 50%, #C4704A 100%)`;
const pageBg     = `linear-gradient(145deg, #FDF7EF 0%, #F9F0E4 60%, #F4EAD8 100%)`;

// ─── Shared components ───────────────────────────────────────

const Fonts = () => (
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
);

const WhoTag = ({ who }) => {
  const c = whoConfig[who];
  if (!c) return null;
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:4,
      background:c.bg,color:c.color,fontSize:10,fontWeight:700,
      letterSpacing:"0.04em",padding:"2px 8px",borderRadius:20,
      border:`1px solid ${c.dot}44`,textTransform:"uppercase",whiteSpace:"nowrap",
    }}>
      <span style={{width:5,height:5,borderRadius:"50%",background:c.dot}}/>
      {c.label}
    </span>
  );
};

const CheckBox = ({ done, onToggle }) => (
  <button onClick={onToggle} style={{
    width:24,height:24,borderRadius:7,flexShrink:0,cursor:"pointer",
    background:done ? C.green : "white",
    border:`2px solid ${done ? C.green : "#D0C0B0"}`,
    display:"flex",alignItems:"center",justifyContent:"center",
    transition:"all 0.2s",
  }}>
    {done && <span style={{color:"white",fontSize:14,lineHeight:1}}>✓</span>}
  </button>
);

const AddInput = ({ placeholder, value, onChange, onAdd }) => (
  <div style={{display:"flex",gap:8,marginBottom:14}}>
    <input
      value={value} onChange={e=>onChange(e.target.value)}
      onKeyDown={e=>e.key==="Enter"&&onAdd()}
      placeholder={placeholder}
      style={{
        flex:1,padding:"11px 14px",borderRadius:10,
        border:`1px solid ${C.border}`,background:"white",
        fontSize:14,fontFamily:"'DM Sans',sans-serif",
        color:C.brown,outline:"none",
      }}
    />
    <button onClick={onAdd} style={{
      padding:"11px 20px",borderRadius:10,
      background:C.terracotta,border:"none",
      color:"white",fontSize:20,cursor:"pointer",
    }}>+</button>
  </div>
);

const SectionDivider = ({ label }) => (
  <div style={{
    display:"flex",alignItems:"center",gap:8,
    fontSize:11,fontWeight:700,color:C.muted,
    letterSpacing:"0.08em",textTransform:"uppercase",
    margin:"18px 0 8px",
  }}>
    <span style={{flex:1,height:1,background:C.border}}/>
    {label}
    <span style={{flex:1,height:1,background:C.border}}/>
  </div>
);

const Header = ({ title, sub, children }) => (
  <div style={{background:headerGrad,padding:"20px 16px 16px",color:"white"}}>
    <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600,marginBottom:sub?2:0}}>{title}</div>
    {sub && <div style={{fontSize:13,color:"#F5DDD0",marginBottom:children?14:0}}>{sub}</div>}
    {children}
  </div>
);

const Toggler = ({ options, value, onChange }) => (
  <div style={{display:"flex",background:"rgba(0,0,0,0.2)",borderRadius:10,padding:3,gap:3}}>
    {options.map(o=>(
      <button key={o.id} onClick={()=>onChange(o.id)} style={{
        flex:1,padding:"8px 0",background:value===o.id?"rgba(255,255,255,0.25)":"transparent",
        border:"none",borderRadius:8,color:"white",fontSize:13,
        fontWeight:value===o.id?700:500,cursor:"pointer",
        fontFamily:"'DM Sans',sans-serif",
      }}>{o.label}</button>
    ))}
  </div>
);

// ─── TODAY TAB ───────────────────────────────────────────────

function TodayTab() {
  const [person, setPerson]   = useState("hafsa");
  const [checked, setChecked] = useState({});
  const todayStr  = getTodayStr();
  const dayIndex  = getDayIndex();
  const weekNum   = getWeekOfMonth();
  const weekLabel = `Week ${weekNum}`;

  useEffect(()=>{
    return onValue(ref(db,`checked/${todayStr}`), snap=>{
      setChecked(snap.val()||{});
    });
  },[todayStr]);

  const isChecked = (id, who) => {
    const owner = who === "both" ? "both" : who;
    return !!(checked?.[owner]?.[id]);
  };

  const toggle = (id, who) => {
    const owner = who === "both" ? "both" : who;
    const cur   = !!(checked?.[owner]?.[id]);
    set(ref(db,`checked/${todayStr}/${owner}/${id}`), !cur);
  };

  // Build task sections for chosen person
  const todayWeekly   = weekly.find(w=>w.dayIndex===dayIndex);
  const todayMonthly  = monthly.filter(m=>m.week===weekLabel);

  const dailyTasks = [
    ...daily.morning.tasks,
    ...daily.noon.tasks,
    ...daily.evening.tasks,
  ].filter(t=>t.who===person||t.who==="both");

  const weeklyTasks = todayWeekly
    ? todayWeekly.tasks.filter(t=>t.who===person||t.who==="both")
    : [];

  const monthlyTasks = todayMonthly.filter(t=>t.who===person||t.who==="both");

  const allTasks  = [...dailyTasks,...weeklyTasks,...monthlyTasks];
  const doneCount = allTasks.filter(t=>isChecked(t.id,t.who)).length;
  const progress  = allTasks.length>0 ? doneCount/allTasks.length : 0;

  const TaskItem = ({task}) => {
    const done = isChecked(task.id, task.who);
    return (
      <button onClick={()=>toggle(task.id,task.who)} style={{
        display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
        borderRadius:10,background:done?"#F0F7F2":"#FDFAF6",
        border:`1px solid ${done?"#C0DECA":C.border}`,
        cursor:"pointer",textAlign:"left",width:"100%",transition:"all 0.2s",
      }}>
        <CheckBox done={done} onToggle={()=>{}}/>
        <span style={{
          fontSize:14,color:done?"#8AAA90":C.brown,flex:1,lineHeight:1.4,
          textDecoration:done?"line-through":"none",
          fontFamily:"'DM Sans',sans-serif",
        }}>{task.task}</span>
        {task.who==="both"&&<WhoTag who="both"/>}
      </button>
    );
  };

  return (
    <div>
      <Header title={formatDate()} sub={`${weekLabel} of the month`}>
        <Toggler
          options={[{id:"hafsa",label:"🌸 Hafsa"},{id:"adnan",label:"⭐ Adnan"}]}
          value={person} onChange={setPerson}
        />
        <div style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#F5DDD0",marginBottom:5}}>
            <span>{doneCount} of {allTasks.length} done</span>
            <span>{Math.round(progress*100)}%</span>
          </div>
          <div style={{height:7,background:"rgba(255,255,255,0.2)",borderRadius:4,overflow:"hidden"}}>
            <div style={{
              height:"100%",borderRadius:4,transition:"width 0.4s ease",
              width:`${progress*100}%`,
              background:progress===1?"#6AAE7C":"rgba(255,255,255,0.75)",
            }}/>
          </div>
          {progress===1&&allTasks.length>0&&(
            <div style={{fontSize:12,color:"#C8F0D0",textAlign:"center",marginTop:6}}>
              ✨ All done for today! Masha'Allah!
            </div>
          )}
        </div>
      </Header>

      <div style={{padding:"14px 14px 0",maxWidth:600,margin:"0 auto"}}>
        {dailyTasks.length>0&&(
          <>
            <SectionDivider label="Daily"/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {dailyTasks.map(t=><TaskItem key={t.id} task={t}/>)}
            </div>
          </>
        )}
        {weeklyTasks.length>0&&(
          <>
            <SectionDivider label={`${todayWeekly?.day} — ${todayWeekly?.focus}`}/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {weeklyTasks.map(t=><TaskItem key={t.id} task={t}/>)}
            </div>
          </>
        )}
        {monthlyTasks.length>0&&(
          <>
            <SectionDivider label={`${weekLabel} — Monthly`}/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {monthlyTasks.map(t=><TaskItem key={t.id} task={t}/>)}
            </div>
          </>
        )}
        {allTasks.length===0&&(
          <div style={{textAlign:"center",padding:50,color:C.muted}}>
            No tasks assigned to {person} today!
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SCHEDULE TAB (reference) ────────────────────────────────

function ScheduleTab() {
  const [tab, setTab] = useState("daily");

  const SectionBlock = ({title,time,emoji,tasks})=>(
    <div style={{marginBottom:22}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:6}}>
          {emoji} {title}
        </div>
        {time&&<span style={{fontSize:11,color:"#B09070",fontWeight:600,background:"#F5EDE0",padding:"3px 10px",borderRadius:20,border:"1px solid #E8D8C0"}}>{time}</span>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {tasks.map((t,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderRadius:10,background:"#FDFAF6",border:`1px solid ${C.border}`,gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:14,color:C.brown,flex:1}}>{t.task}</span>
            <WhoTag who={t.who}/>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <Header title="📅 Schedule" sub="Your full home routine"/>
      {/* Tabs */}
      <div style={{display:"flex",background:"#F0E8DB",borderBottom:`2px solid ${C.border}`,position:"sticky",top:0,zIndex:10}}>
        {[{id:"daily",l:"☀️ Daily"},{id:"weekly",l:"📅 Weekly"},{id:"monthly",l:"🗓️ Monthly"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,padding:"13px 8px",background:tab===t.id?"#FDF7EF":"transparent",
            border:"none",borderBottom:tab===t.id?`3px solid ${C.terracotta}`:"3px solid transparent",
            color:tab===t.id?"#8B3A1A":C.muted,fontSize:12,fontWeight:tab===t.id?700:500,
            cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
          }}>{t.l}</button>
        ))}
      </div>

      <div style={{padding:"16px",maxWidth:600,margin:"0 auto"}}>
        {tab==="daily"&&(
          <>
            <SectionBlock title={daily.morning.label} time={daily.morning.time} emoji="🌅" tasks={daily.morning.tasks}/>
            <SectionBlock title={daily.noon.label}    time={daily.noon.time}    emoji="☀️" tasks={daily.noon.tasks}/>
            <SectionBlock title={daily.evening.label} time={daily.evening.time} emoji="🌙" tasks={daily.evening.tasks}/>
          </>
        )}
        {tab==="weekly"&&weekly.map((day,i)=>(
          <div key={i} style={{marginBottom:14,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
            <div style={{background:"linear-gradient(90deg,#EDE0D0,#F5EDE0)",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,color:"#5A3020",fontWeight:600}}>{day.emoji} {day.day}</span>
              <span style={{fontSize:11,fontWeight:700,color:"#9A6040",textTransform:"uppercase",letterSpacing:"0.06em",background:"#FDE8D8",padding:"3px 10px",borderRadius:20,border:"1px solid #E8C0A0"}}>{day.focus}</span>
            </div>
            <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:5}}>
              {day.tasks.map((t,j)=>(
                <div key={j} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:8,background:"#FDFAF6",border:`1px solid ${C.border}`,gap:10,flexWrap:"wrap"}}>
                  <div style={{flex:1}}>
                    <span style={{fontSize:13,color:C.brown}}>{t.task}</span>
                    {t.note&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{t.note}</div>}
                  </div>
                  <WhoTag who={t.who}/>
                </div>
              ))}
            </div>
          </div>
        ))}
        {tab==="monthly"&&["Week 1","Week 2","Week 3","Week 4"].map(w=>{
          const tasks=monthly.filter(m=>m.week===w);
          return(
            <div key={w} style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{flex:1,height:1,background:C.border}}/> 📌 {w} <span style={{flex:1,height:1,background:C.border}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {tasks.map((t,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderRadius:10,background:"#FDFAF6",border:`1px solid ${C.border}`,gap:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,color:C.brown,flex:1}}>{t.task}</span>
                    <WhoTag who={t.who}/>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── GROCERIES TAB ───────────────────────────────────────────

function GroceriesTab() {
  const [list,   setList]  = useState("monthly");
  const [items,  setItems] = useState({monthly:[],bw1:[],bw2:[]});
  const [input,  setInput] = useState("");

  const listMeta = {
    monthly: {label:"📦 Monthly Order",  key:"monthly"},
    bw1:     {label:"🛒 Bi-weekly A",    key:"bw1"},
    bw2:     {label:"🛒 Bi-weekly B",    key:"bw2"},
  };

  useEffect(()=>{
    return onValue(ref(db,"groceries"),snap=>{
      const v=snap.val()||{};
      const parse=obj=>obj?Object.entries(obj).map(([id,d])=>({id,...d})):[];
      setItems({monthly:parse(v.monthly),bw1:parse(v.bw1),bw2:parse(v.bw2)});
    });
  },[]);

  const addItem=()=>{
    if(!input.trim())return;
    push(ref(db,`groceries/${list}`),{text:input.trim(),done:false});
    setInput("");
  };
  const toggleItem=(id,done)=>update(ref(db,`groceries/${list}/${id}`),{done:!done});
  const deleteItem=(id)=>remove(ref(db,`groceries/${list}/${id}`));
  const clearDone=()=>items[list].filter(i=>i.done).forEach(i=>remove(ref(db,`groceries/${list}/${i.id}`)));

  const current = items[list]||[];
  const doneCount = current.filter(i=>i.done).length;

  return (
    <div>
      <Header title="🛒 Groceries">
        <Toggler
          options={Object.entries(listMeta).map(([id,m])=>({id,label:m.label.split(" ").slice(1).join(" ")}))}
          value={list} onChange={setList}
        />
      </Header>

      <div style={{padding:"14px",maxWidth:600,margin:"0 auto"}}>
        <AddInput placeholder="Add item..." value={input} onChange={setInput} onAdd={addItem}/>

        {doneCount>0&&(
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:12,color:C.muted}}>{doneCount} item{doneCount>1?"s":""} ticked</span>
            <button onClick={clearDone} style={{fontSize:12,color:C.terracotta,background:"none",border:`1px solid ${C.terracotta}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Clear ticked
            </button>
          </div>
        )}

        {current.length===0
          ? <div style={{textAlign:"center",padding:50,color:C.muted,fontSize:14}}>List is empty — add items above!</div>
          : <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {current.map(item=>(
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,background:item.done?"#F5F5F0":"#FDFAF6",border:`1px solid ${item.done?"#DDD":C.border}`}}>
                  <CheckBox done={item.done} onToggle={()=>toggleItem(item.id,item.done)}/>
                  <span style={{flex:1,fontSize:14,color:item.done?"#AAA":C.brown,textDecoration:item.done?"line-through":"none",fontFamily:"'DM Sans',sans-serif"}}>{item.text}</span>
                  <button onClick={()=>deleteItem(item.id)} style={{width:28,height:28,borderRadius:6,border:"none",background:"#FEE8E8",color:"#C0504A",cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

// ─── HOME TO-DO TAB ──────────────────────────────────────────

function HomeTodoTab() {
  const [todos,   setTodos]   = useState([]);
  const [input,   setInput]   = useState("");
  const [addedBy, setAddedBy] = useState("hafsa");

  useEffect(()=>{
    return onValue(ref(db,"todos"),snap=>{
      const v=snap.val()||{};
      setTodos(Object.entries(v).map(([id,d])=>({id,...d})).reverse());
    });
  },[]);

  const addTodo=()=>{
    if(!input.trim())return;
    push(ref(db,"todos"),{text:input.trim(),done:false,addedBy,date:getTodayStr()});
    setInput("");
  };
  const toggleTodo=(id,done)=>update(ref(db,`todos/${id}`),{done:!done});
  const deleteTodo=(id)=>remove(ref(db,`todos/${id}`));

  const open=todos.filter(t=>!t.done);
  const done=todos.filter(t=>t.done);

  return (
    <div>
      <Header title="🔧 Home To-Do" sub="Repairs, errands & one-off tasks"/>
      <div style={{padding:"14px",maxWidth:600,margin:"0 auto"}}>
        <AddInput placeholder="Add a task..." value={input} onChange={setInput} onAdd={addTodo}/>

        {/* Who is adding */}
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {["hafsa","adnan"].map(p=>(
            <button key={p} onClick={()=>setAddedBy(p)} style={{
              flex:1,padding:"8px",
              background:addedBy===p?whoConfig[p].bg:"transparent",
              border:`1px solid ${addedBy===p?whoConfig[p].dot:C.border}`,
              borderRadius:8,fontSize:12,fontWeight:addedBy===p?700:400,
              color:addedBy===p?whoConfig[p].color:C.muted,
              cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize",
            }}>Adding as {p}</button>
          ))}
        </div>

        {open.length>0&&(
          <>
            <SectionDivider label={`Open (${open.length})`}/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {open.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,background:"#FDFAF6",border:`1px solid ${C.border}`}}>
                  <CheckBox done={false} onToggle={()=>toggleTodo(t.id,false)}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,color:C.brown,fontFamily:"'DM Sans',sans-serif"}}>{t.text}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2,textTransform:"capitalize"}}>
                      {t.addedBy} · {t.date}
                    </div>
                  </div>
                  <button onClick={()=>deleteTodo(t.id)} style={{width:28,height:28,borderRadius:6,border:"none",background:"#FEE8E8",color:"#C0504A",cursor:"pointer",fontSize:16}}>×</button>
                </div>
              ))}
            </div>
          </>
        )}

        {done.length>0&&(
          <>
            <SectionDivider label="Done ✓"/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {done.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,background:"#F5F5F0",border:"1px solid #DDD",opacity:0.7}}>
                  <CheckBox done={true} onToggle={()=>toggleTodo(t.id,true)}/>
                  <span style={{flex:1,fontSize:14,color:"#AAA",textDecoration:"line-through",fontFamily:"'DM Sans',sans-serif"}}>{t.text}</span>
                  <button onClick={()=>deleteTodo(t.id)} style={{width:28,height:28,borderRadius:6,border:"none",background:"#F0F0F0",color:"#CCC",cursor:"pointer",fontSize:16}}>×</button>
                </div>
              ))}
            </div>
          </>
        )}

        {todos.length===0&&(
          <div style={{textAlign:"center",padding:50,color:C.muted,fontSize:14}}>Nothing here yet — add a task!</div>
        )}
      </div>
    </div>
  );
}

// ─── MEAL PLAN TAB ───────────────────────────────────────────

const WEEK_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function MealPlanTab() {
  const [view,      setView]      = useState("week1");
  const [meals,     setMeals]     = useState({week1:{},week2:{}});
  const [labels,    setLabels]    = useState({week1:"Week 1",week2:"Week 2"});
  const [prep,      setPrep]      = useState([]);
  const [prepInput, setPrepInput] = useState("");
  const [editDay,   setEditDay]   = useState(null);
  const [editVal,   setEditVal]   = useState("");
  const [editLabel, setEditLabel] = useState(null);
  const [labelVal,  setLabelVal]  = useState("");

  useEffect(()=>{
    return onValue(ref(db,"mealplan"),snap=>{
      const v=snap.val()||{};
      setMeals({week1:v.week1?.days||{},week2:v.week2?.days||{}});
      setLabels({week1:v.week1?.label||"Week 1",week2:v.week2?.label||"Week 2"});
      setPrep(v.prep?Object.entries(v.prep).map(([id,d])=>({id,...d})):[]);
    });
  },[]);

  const saveDay=(week,day,val)=>{
    set(ref(db,`mealplan/${week}/days/${day}`),val);
    setEditDay(null);
  };
  const saveLabel=(week,val)=>{
    set(ref(db,`mealplan/${week}/label`),val);
    setEditLabel(null);
  };
  const addPrep=()=>{
    if(!prepInput.trim())return;
    push(ref(db,"mealplan/prep"),{text:prepInput.trim(),done:false});
    setPrepInput("");
  };
  const togglePrep=(id,done)=>update(ref(db,`mealplan/prep/${id}`),{done:!done});
  const deletePrep=(id)=>remove(ref(db,`mealplan/prep/${id}`));

  const currentMeals = view==="week1"?meals.week1:meals.week2;

  return (
    <div>
      <Header title="🍽️ Meal Plan">
        <Toggler
          options={[
            {id:"week1",label:labels.week1},
            {id:"week2",label:labels.week2},
            {id:"prep", label:"🥄 Sat Prep"},
          ]}
          value={view} onChange={setView}
        />
      </Header>

      <div style={{padding:"14px",maxWidth:600,margin:"0 auto"}}>

        {(view==="week1"||view==="week2")&&(
          <>
            {/* Editable week label */}
            {editLabel===view ? (
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <input value={labelVal} onChange={e=>setLabelVal(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&saveLabel(view,labelVal)}
                  style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none"}}
                  autoFocus/>
                <button onClick={()=>saveLabel(view,labelVal)} style={{padding:"8px 14px",borderRadius:8,background:C.terracotta,border:"none",color:"white",fontSize:13,cursor:"pointer"}}>Save</button>
              </div>
            ) : (
              <button onClick={()=>{setEditLabel(view);setLabelVal(labels[view]);}} style={{
                background:"#F5EDE0",border:`1px solid ${C.border}`,borderRadius:8,
                padding:"6px 12px",fontSize:12,color:C.muted,cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",marginBottom:14,
              }}>✏️ {labels[view]} — tap to rename</button>
            )}

            {/* Day list */}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {WEEK_DAYS.map(day=>(
                <div key={day}>
                  {editDay===`${view}-${day}` ? (
                    <div style={{padding:"12px 14px",borderRadius:10,background:"white",border:`1.5px solid ${C.terracotta}`}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{day}</div>
                      <textarea value={editVal} onChange={e=>setEditVal(e.target.value)} rows={2} autoFocus
                        style={{width:"100%",border:"none",outline:"none",resize:"none",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:C.brown,background:"transparent",boxSizing:"border-box"}}/>
                      <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:6}}>
                        <button onClick={()=>setEditDay(null)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",fontSize:12,cursor:"pointer"}}>Cancel</button>
                        <button onClick={()=>saveDay(view,day,editVal)} style={{padding:"5px 14px",borderRadius:6,border:"none",background:C.terracotta,color:"white",fontSize:12,cursor:"pointer"}}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={()=>{setEditDay(`${view}-${day}`);setEditVal(currentMeals[day]||"");}} style={{
                      display:"flex",alignItems:"flex-start",gap:12,width:"100%",
                      padding:"11px 14px",borderRadius:10,cursor:"pointer",textAlign:"left",
                      background:currentMeals[day]?"#FDFAF6":"#F7F4EF",
                      border:`1px solid ${currentMeals[day]?C.border:"#EDE5D8"}`,
                    }}>
                      <span style={{fontSize:11,fontWeight:700,color:C.muted,minWidth:38,paddingTop:2,textTransform:"uppercase"}}>{day.slice(0,3)}</span>
                      <span style={{fontSize:14,color:currentMeals[day]?C.brown:"#C0A890",fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>
                        {currentMeals[day]||"Tap to add meal..."}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {view==="prep"&&(
          <>
            <p style={{fontSize:13,color:C.muted,marginBottom:14,lineHeight:1.6}}>
              Saturday prep — chop, grind & cook ahead 🥄
            </p>
            <AddInput placeholder="Add prep task..." value={prepInput} onChange={setPrepInput} onAdd={addPrep}/>
            {prep.length===0
              ? <div style={{textAlign:"center",padding:40,color:C.muted,fontSize:14}}>Add your Saturday prep tasks!</div>
              : <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {prep.map(item=>(
                    <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,background:item.done?"#F5F5F0":"#FDFAF6",border:`1px solid ${item.done?"#DDD":C.border}`}}>
                      <CheckBox done={item.done} onToggle={()=>togglePrep(item.id,item.done)}/>
                      <span style={{flex:1,fontSize:14,color:item.done?"#AAA":C.brown,textDecoration:item.done?"line-through":"none",fontFamily:"'DM Sans',sans-serif"}}>{item.text}</span>
                      <button onClick={()=>deletePrep(item.id)} style={{width:28,height:28,borderRadius:6,border:"none",background:"#FEE8E8",color:"#C0504A",cursor:"pointer",fontSize:16}}>×</button>
                    </div>
                  ))}
                </div>
            }
          </>
        )}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV & APP SHELL ──────────────────────────────────

const NAV = [
  {id:"today",    emoji:"✅", label:"Today"},
  {id:"groceries",emoji:"🛒", label:"Groceries"},
  {id:"todos",    emoji:"🔧", label:"To-Do"},
  {id:"meals",    emoji:"🍽️", label:"Meals"},
  {id:"schedule", emoji:"📅", label:"Schedule"},
];

export default function App() {
  const [tab, setTab] = useState("today");

  return (
    <div style={{minHeight:"100vh",background:pageBg,fontFamily:"'DM Sans',sans-serif",paddingBottom:72}}>
      <Fonts/>

      {tab==="today"     && <TodayTab/>}
      {tab==="groceries" && <GroceriesTab/>}
      {tab==="todos"     && <HomeTodoTab/>}
      {tab==="meals"     && <MealPlanTab/>}
      {tab==="schedule"  && <ScheduleTab/>}

      {/* Bottom nav */}
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,
        background:"white",borderTop:`1px solid ${C.border}`,
        display:"flex",padding:"8px 0 10px",
        boxShadow:"0 -2px 12px rgba(0,0,0,0.07)",zIndex:100,
      }}>
        {NAV.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,background:"none",border:"none",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            padding:"2px 0",
          }}>
            <span style={{fontSize:20}}>{t.emoji}</span>
            <span style={{
              fontSize:10,fontFamily:"'DM Sans',sans-serif",
              fontWeight:tab===t.id?700:400,
              color:tab===t.id?C.terracotta:C.muted,
            }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
