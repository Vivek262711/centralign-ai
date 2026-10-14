 "use client";
import { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bot, Check, CheckCircle2, ChevronDown,
  CircleHelp, Clock3, Command, FileText, Gauge, History, LayoutDashboard, ListChecks,
  LoaderCircle, LockKeyhole, Menu, MoreHorizontal, Play, Plus, Search, Settings2,
  ShieldCheck, Sparkles, Terminal, TriangleAlert, WalletCards, X, Zap
} from "lucide-react";

type Task = {
  id: string; title: string; prompt: string; status: string; createdAt: string;
  steps: { label: string; status: string; detail?: string }[]; logs: string[];
  result?: string; approvalRequired?: boolean; scenario?: string;
};
const templates = [
  { title: "Process an invoice", prompt: "Find the latest invoice from Acme Technologies and record it in finance.", icon: WalletCards, tag: "Finance" },
  { title: "Prepare overdue report", prompt: "Find all overdue invoices and calculate the total outstanding amount.", icon: FileText, tag: "Reporting" },
  { title: "Draft customer response", prompt: "Find Rahul's latest unresolved support ticket, summarize it, and draft an appropriate response.", icon: CircleHelp, tag: "Support" },
];
const initialTasks: Task[] = [
  { id:"TSK-1048", title:"Prepare weekly revenue report", prompt:"Prepare a weekly revenue report from finance records.", status:"completed", createdAt:"10:42 AM", steps:[{label:"Query finance records",status:"done"},{label:"Calculate totals",status:"done"},{label:"Verify report",status:"done"}], logs:["Loaded finance records","Calculated totals from source data","Report totals independently verified"], result:"Report generated and verified." },
  { id:"TSK-1047", title:"Review Acme invoice", prompt:"Find the latest invoice from Acme Technologies.", status:"needs_approval", createdAt:"10:18 AM", steps:[{label:"Search invoice repository",status:"done"},{label:"Validate extracted fields",status:"done"},{label:"Request finance approval",status:"waiting"}], logs:["Found invoice INV-2026-104","Validated amount and due date","Awaiting approval before finance write"], result:"Invoice is ready for review.", approvalRequired:true },
  { id:"TSK-1046", title:"Summarize support ticket", prompt:"Summarize the latest unresolved support ticket from Rahul.", status:"completed", createdAt:"09:56 AM", steps:[{label:"Search support tickets",status:"done"},{label:"Draft response",status:"done"},{label:"Verify saved draft",status:"done"}], logs:["Found ticket SUP-2281","Draft created and saved","Read-back verification passed"], result:"Support response draft saved." },
];
const invoices = [
  { id:"INV-2026-104", vendor:"Acme Technologies", amount:4280, due:"2026-10-20", status:"Due soon" },
  { id:"INV-2026-097", vendor:"Northstar Labs", amount:1850, due:"2026-10-03", status:"Overdue" },
  { id:"INV-2026-091", vendor:"Acme Technologies", amount:2190, due:"2026-09-22", status:"Overdue" },
  { id:"INV-2026-088", vendor:"Vertex Systems", amount:6720, due:"2026-09-18", status:"Overdue" },
];
const money = (n:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
export default function Home() {
  const [section,setSection] = useState("Overview");
  const [tasks,setTasks] = useState<Task[]>(initialTasks);
  const [financeRecords,setFinanceRecords] = useState<{id:string;vendor:string;amount:number;due:string}[]>([]);
  const [supportDrafts,setSupportDrafts] = useState<{id:string;customer:string;body:string}[]>([]);
  const [prompt,setPrompt] = useState("");
  const [selected,setSelected] = useState<Task | null>(null);
  const [busy,setBusy] = useState(false);
  const [search,setSearch] = useState("");
  const [fault,setFault] = useState("none");
  const [notice,setNotice] = useState("");
  const [mobileNav,setMobileNav] = useState(false);
  const pending = tasks.filter(t=>t.status==="needs_approval");
  const completed = tasks.filter(t=>t.status==="completed").length;
  const filtered = useMemo(()=>tasks.filter(t=>(t.title+" "+t.id+" "+t.status).toLowerCase().includes(search.toLowerCase())),[tasks,search]);

  async function runTask(raw:string) {
    if(!raw.trim() || busy) return;
    setBusy(true); setSection("Workspace"); setNotice("");
    const invoiceMode = /invoice|finance|overdue|outstanding/i.test(raw);
    const supportMode = /support|ticket|customer|rahul/i.test(raw);
    const reportMode = /overdue|report|total|outstanding/i.test(raw);
    const unsupported = /transfer money|bank transfer|wire transfer|pay vendor/i.test(raw);
    const id = "TSK-"+(1050+tasks.length);
    const title = raw.length > 44 ? raw.slice(0,44)+"…" : raw;
    const task:Task = {id,title,prompt:raw,status:"running",createdAt:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),steps:[],logs:[],scenario:fault};
    setTasks(prev=>[task,...prev]); setSelected(task);
    const pushStep=(label:string,status:string,detail?:string)=>{
      task.steps=[...task.steps,{label,status,detail}]; task.logs=[...task.logs,`${new Date().toLocaleTimeString()} · ${label}${detail?": "+detail:""}`];
      setTasks(prev=>prev.map(t=>t.id===id?{...task}:t)); setSelected({...task});
    };
    await new Promise(r=>setTimeout(r,450));
    if(unsupported){
      pushStep("Check permitted actions","done","Money transfers are not supported");
      task.status="blocked"; task.result="This action is outside the prototype's permitted tools. No transaction was attempted.";
    } else if(reportMode){
      pushStep("Understand objective","done","Generate an overdue invoice report");
      pushStep("Query invoice records","done",`${invoices.filter(i=>new Date(i.due)<new Date("2026-10-14")).length} records matched`);
      await new Promise(r=>setTimeout(r,350));
      const overdue=invoices.filter(i=>new Date(i.due)<new Date("2026-10-14"));
      const total=overdue.reduce((sum,i)=>sum+i.amount,0);
      pushStep("Calculate outstanding amount","done",money(total));
      pushStep("Verify report totals","done","Recalculated independently from source records");
      task.status="completed"; task.result=`Overdue invoice report generated. ${overdue.length} invoices; total outstanding ${money(total)}.`;
    } else if(invoiceMode) {
      pushStep("Understand objective","done","Locate invoice and record it in finance");
      pushStep("Search invoice repository","done","Matched Acme Technologies · INV-2026-104");
      pushStep("Validate invoice fields","done","Vendor, invoice number, amount and due date present");
      if(fault==="transient"){
        pushStep("Write finance record","failed","Simulated transient storage error");
        await new Promise(r=>setTimeout(r,300));
        pushStep("Retry finance write","done","Retry succeeded");
      }
      task.status="needs_approval"; task.approvalRequired=true;
      task.steps=[...task.steps,{label:"Finance record write",status:"waiting",detail:"Awaiting human approval"}];
      task.logs=[...task.logs,"Approval required before writing financial records."];
      task.result="Invoice INV-2026-104 · Acme Technologies · ₹4,280 · Due 20 Oct 2026. Review the proposed finance record in Approval Center.";
    } else if(supportMode){
      pushStep("Understand objective","done","Find unresolved customer ticket and prepare a draft");
      pushStep("Search support tickets","done","Matched SUP-2281 · Rahul");
      pushStep("Draft response","done","Draft generated for human review");
      task.status="needs_approval"; task.approvalRequired=true;
      task.steps=[...task.steps,{label:"Save support draft","status":"waiting",detail:"Awaiting human approval"}];
      task.result="Draft is ready for review. It will not be sent to the customer.";
    } else {
      pushStep("Interpret request","done","No matching supported workflow identified");
      task.status="awaiting_clarification"; task.result="I can process invoices, create overdue reports, or draft support responses. Please clarify the business outcome or choose a template.";
    }
    if(fault==="verification" && task.status==="completed"){
      task.steps=[...task.steps,{label:"Verification check","status":"failed",detail:"Test scenario: read-back mismatch"}];
      task.status="failed"; task.result="The verification check failed. The task is not marked completed.";
      task.logs=[...task.logs,"Completion blocked because verification did not pass."];
    }
    setTasks(prev=>prev.map(t=>t.id===id?{...task}:t)); setSelected({...task}); setBusy(false);
  }
  function decide(task:Task, approve:boolean) {
    const next:Task={...task,steps:[...task.steps],logs:[...task.logs]};
    if(approve){
      next.logs.push(`${new Date().toLocaleTimeString()} · Human approved proposed action`);
      const supportTask = task.prompt.toLowerCase().includes("support") || task.prompt.toLowerCase().includes("ticket") || task.prompt.toLowerCase().includes("rahul");
      if (supportTask) {
        const draft = { id: "DRF-" + (supportDrafts.length + 1).toString().padStart(3,"0"), customer: "Rahul", body: "Hi Rahul, thanks for reporting this issue. We’re reviewing the details and will follow up with the next steps shortly." };
        const updatedDrafts = [...supportDrafts, draft];
        setSupportDrafts(updatedDrafts);
        const readBack = updatedDrafts.find(d => d.id === draft.id);
        if (!readBack || readBack.body !== draft.body) { next.status="failed"; next.result="Verification failed: saved draft could not be read back."; }
      } else {
        const record = { id: "FIN-" + (financeRecords.length + 1).toString().padStart(3,"0"), vendor: "Acme Technologies", amount: 4280, due: "2026-10-20" };
        const updatedRecords = [...financeRecords, record];
        setFinanceRecords(updatedRecords);
        const readBack = updatedRecords.find(r => r.id === record.id);
        if (!readBack || readBack.amount !== record.amount || readBack.vendor !== record.vendor || readBack.due !== record.due) { next.status="failed"; next.result="Verification failed: finance record did not match the proposed values."; }
      }
      next.steps=next.steps.map(s=>s.status==="waiting"?{...s,status:"done",detail:"Approved, executed and read back"}:s);
      next.logs.push("Session record read back; required fields matched.");
      next.status="completed"; if (next.status !== "failed") next.result=supportTask?"Support draft saved in this session and verified by read-back. No message was sent.":"Finance record saved in this session and verified by read-back: Acme Technologies · ₹4,280.";
    } else {
      next.logs.push(`${new Date().toLocaleTimeString()} · Human rejected proposed action`);
      next.steps=next.steps.map(s=>s.status==="waiting"?{...s,status:"blocked",detail:"Rejected by reviewer"}:s);
      next.status="blocked"; next.result="Action rejected. No business record was written.";
    }
    setTasks(prev=>prev.map(t=>t.id===task.id?next:t)); setSelected(next); setNotice(approve?"Approval recorded. Execution verified.":"Action rejected; no write was performed.");
  }
  const nav = [
    {name:"Overview",icon:LayoutDashboard},
    {name:"Task workspace",icon:Zap},
    {name:"Approval center",icon:ShieldCheck,count:pending.length},
    {name:"Task history",icon:History},
    {name:"Business data",icon:WalletCards},
    {name:"Execution logs",icon:Terminal},
  ];
  function go(name:string){setSection(name);setMobileNav(false);setNotice("");}
  return <main className="app-shell">
    <aside className={`sidebar ${mobileNav?"show":""}`}>
      <div className="brand"><div className="brand-mark"><Command size={19}/></div><div><div className="brand-name">centralign<span>.</span></div><div className="brand-sub">AI OPERATIONS PLATFORM</div></div><button className="mobile-close icon-button" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-pill"><div className="workspace-avatar">C</div><div className="workspace-copy"><strong>CentrAlign workspace</strong><span>Demo environment</span></div><ChevronDown size={15} className="muted"/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(n=><button key={n.name} onClick={()=>go(n.name==="Task workspace"?"Workspace":n.name)} className={`nav-item ${(section===n.name || (section==="Workspace"&&n.name==="Task workspace"))?"active":""}`}><n.icon size={17}/><span>{n.name}</span>{n.count? <b className="nav-count">{n.count}</b>:null}</button>)}</nav>
      <div className="sidebar-bottom"><div className="status-card"><div className="status-top"><span className="live-dot"/>Agent runtime</div><strong>Operational</strong><p>Demo tools available · LLM optional</p><div className="status-line"><span/></div></div><button className="nav-item" onClick={()=>go("Settings")}><Settings2 size={17}/><span>Settings</span></button><div className="profile"><div className="profile-avatar">VK</div><div><strong>Vivek Kumar</strong><span>Workspace owner</span></div><MoreHorizontal size={18} className="muted"/></div></div>
    </aside>
    <section className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{section==="Workspace"?"Task workspace":section}</strong></div><div className="top-actions"><div className="env-chip"><span className="live-dot"/> Demo mode</div><button className="icon-button" title="Activity"><Activity size={18}/></button><div className="top-avatar">VK</div></div></header>
      <div className="content">
        {section==="Overview" && <><div className="page-heading"><div><div className="eyebrow"><Sparkles size={14}/> AUTONOMOUS OPERATIONS</div><h1>Good afternoon, Vivek <span className="wave">✳</span></h1><p>Delegate the busywork. Your AI employee is ready to execute.</p></div><button className="primary-button" onClick={()=>go("Workspace")}><Plus size={17}/> New task</button></div>
          <div className="metric-grid">
            <Metric title="Tasks completed" value={String(completed+12)} change="+18.4%" icon={CheckCircle2} tone="green" sub="vs. previous 7 days"/>
            <Metric title="Awaiting approval" value={String(pending.length+2)} change="Needs review" icon={Clock3} tone="amber" sub="Human-in-the-loop queue"/>
            <Metric title="Execution success" value="94.2%" change="+3.1%" icon={Gauge} tone="blue" sub="Last 30 days · demo data"/>
            <Metric title="Hours saved" value="26.5h" change="+12.8%" icon={Zap} tone="purple" sub="Estimated time reclaimed"/>
          </div>
          <div className="section-heading"><div><h2>Start with a workflow</h2><p>Choose a task or describe an outcome in your own words.</p></div><button className="text-button" onClick={()=>go("Workspace")}>Open workspace <ArrowUpRight size={15}/></button></div>
          <div className="template-grid">{templates.map(t=><button className="template-card" key={t.title} onClick={()=>{setPrompt(t.prompt);go("Workspace")}}><div className="template-top"><div className="template-icon"><t.icon size={19}/></div><span className="template-tag">{t.tag}</span><ArrowUpRight size={16} className="template-arrow"/></div><h3>{t.title}</h3><p>{t.prompt}</p><div className="template-bottom"><span><Zap size={13}/> Ready to run</span><span className="template-start">Use template <ArrowUpRight size={14}/></span></div></button>)}</div>
          <div className="lower-grid"><div className="panel"><div className="panel-heading"><div><h2>Recent tasks</h2><p>Your latest agent activity</p></div><button className="text-button" onClick={()=>go("Task history")}>View all <ArrowUpRight size={14}/></button></div><TaskList tasks={tasks.slice(0,4)} onSelect={t=>{setSelected(t);go("Workspace")}}/></div><div className="panel"><div className="panel-heading"><div><h2>Agent activity</h2><p>Runtime health at a glance</p></div><span className="live-pill"><span className="live-dot"/> Live</span></div><div className="runtime-score"><div className="score-ring"><span>94<small>%</small></span></div><div><strong>Healthy execution</strong><p>Tool registry responding normally.</p><span className="score-foot"><Check size={13}/> Verification enabled</span></div></div><div className="runtime-row"><span>Available tools</span><strong>11 <span className="tiny-muted">/ 11</span></strong></div><div className="runtime-row"><span>Avg. execution time</span><strong>2.4s</strong></div><div className="runtime-row"><span>Approval policy</span><strong className="policy"><LockKeyhole size={13}/> Enforced</strong></div></div></div>
        </>}
        {section==="Workspace" && <><div className="page-heading"><div><div className="eyebrow"><Bot size={14}/> AGENT WORKSPACE</div><h1>What should I get done?</h1><p>Describe the outcome. Your AI employee will plan, act, and verify.</p></div><span className="runtime-badge"><span className="live-dot"/> Runtime ready</span></div>
          <div className="workspace-layout"><div className="panel composer-panel"><div className="composer-label"><Sparkles size={16}/> New task <span className="optional-label">NATURAL LANGUAGE</span></div><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="e.g. Find the latest invoice from Acme Technologies, extract the amount and due date, record it in finance, and confirm completion." rows={5}/><div className="composer-foot"><span><ShieldCheck size={14}/> Actions are permission-checked</span><button className="primary-button" disabled={!prompt.trim()||busy} onClick={()=>runTask(prompt)}>{busy?<LoaderCircle className="spin" size={16}/>:<Play size={15} fill="currentColor"/>} {busy?"Executing…":"Run task"}</button></div><div className="composer-divider"/><div className="subheading">Try a suggested task</div><div className="suggestions">{templates.map(t=><button key={t.title} onClick={()=>setPrompt(t.prompt)}><t.icon size={15}/><span>{t.title}</span><ArrowUpRight size={13}/></button>)}</div><div className="fault-box"><div><strong><TriangleAlert size={14}/> Test a failure scenario</strong><span>For reliability demonstrations only</span></div><select value={fault} onChange={e=>setFault(e.target.value)}><option value="none">No fault</option><option value="transient">Transient tool failure + retry</option><option value="verification">Verification mismatch</option></select></div></div>
            <div className="panel execution-panel"><div className="panel-heading"><div><h2>Execution inspector</h2><p>{selected?selected.id:"Live task trace"}</p></div><span className={`status-pill ${selected?.status||"idle"}`}>{selected?.status?.replace("_"," ")||"Idle"}</span></div>{selected?<><div className="task-current-title">{selected.title}</div><div className="execution-steps">{selected.steps.length?selected.steps.map((s,i)=><div className="execution-step" key={i}><div className={`step-node ${s.status}`}>{s.status==="done"?<Check size={13}/>:s.status==="failed"?<X size={13}/>:s.status==="waiting"?<Clock3 size={13}/>:<span>{i+1}</span>}</div><div className="step-copy"><strong>{s.label}</strong>{s.detail&&<p>{s.detail}</p>}</div><span className={`step-state ${s.status}`}>{s.status}</span></div>):<div className="empty-state"><div className="empty-icon"><Terminal size={22}/></div><strong>Ready for execution</strong><p>Submit a task to see its plan and tool activity here.</p></div>}</div>{selected.result&&<div className="result-box"><div><CheckCircle2 size={16}/><strong>Agent report</strong></div><p>{selected.result}</p>{selected.approvalRequired&&selected.status==="needs_approval"&&<button className="secondary-button" onClick={()=>go("Approval center")}>Review proposed action <ArrowUpRight size={14}/></button>}</div>}<div className="logs-box"><div className="logs-title"><Terminal size={14}/> EXECUTION LOG <span>{selected.logs.length} events</span></div>{selected.logs.length?selected.logs.slice(-5).map((l,i)=><div className="log-line" key={i}><span className="log-dot"/> {l}</div>):<div className="muted small">Logs will appear as the agent executes.</div>}</div></>:<div className="empty-state"><div className="empty-icon"><Activity size={22}/></div><strong>No active task</strong><p>Your plan, tool calls, retries and verification evidence will appear here.</p></div>}</div></div>
        </>}
        {section==="Approval center" && <><div className="page-heading"><div><div className="eyebrow"><ShieldCheck size={14}/> HUMAN-IN-THE-LOOP</div><h1>Approval center</h1><p>Review consequential actions before the agent commits changes.</p></div><span className="count-badge">{pending.length} pending</span></div><div className="panel"><div className="panel-heading"><div><h2>Pending decisions</h2><p>Actions remain paused until you approve them.</p></div></div>{pending.length?pending.map(t=><div className="approval-item" key={t.id}><div className="approval-icon"><LockKeyhole size={19}/></div><div className="approval-main"><div className="approval-title-row"><strong>{t.title}</strong><span className="status-pill needs_approval">Needs approval</span></div><p>{t.result}</p><div className="approval-meta"><span>{t.id}</span><span>•</span><span>Proposed action: {t.prompt.toLowerCase().includes("support")||t.prompt.toLowerCase().includes("ticket")?"Save support response draft":"Create finance record"}</span></div><div className="approval-buttons"><button className="primary-button" onClick={()=>decide(t,true)}><Check size={15}/> Approve & execute</button><button className="danger-button" onClick={()=>decide(t,false)}><X size={15}/> Reject</button><button className="secondary-button" onClick={()=>{setSelected(t);go("Workspace")}}>Inspect task</button></div></div></div>):<div className="empty-state"><div className="empty-icon"><CheckCircle2 size={22}/></div><strong>You're all caught up</strong><p>No pending actions need your approval.</p></div>}</div>{notice&&<div className="toast"><CheckCircle2 size={16}/>{notice}</div>}</>}
        {section==="Task history" && <><div className="page-heading"><div><div className="eyebrow"><History size={14}/> AUDITABLE EXECUTION</div><h1>Task history</h1><p>Every task, decision, and result in one place.</p></div><button className="primary-button" onClick={()=>go("Workspace")}><Plus size={16}/> New task</button></div><div className="panel"><div className="table-toolbar"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks…"/></div><span className="tiny-muted">{filtered.length} tasks</span></div><TaskList tasks={filtered} onSelect={t=>{setSelected(t);go("Workspace")}}/></div></>}
        {section==="Business data" && <><div className="page-heading"><div><div className="eyebrow"><WalletCards size={14}/> CONNECTED DATA</div><h1>Business data</h1><p>Fictional seeded records used by the working demo environment.</p></div><span className="runtime-badge">Seeded dataset</span></div><div className="panel"><div className="panel-heading"><div><h2>Invoice repository</h2><p>Amounts in INR · due dates evaluated against 14 Oct 2026 for demo consistency</p></div><span className="table-count">{invoices.length} records</span></div><div className="data-table"><div className="data-row data-head"><span>Invoice / vendor</span><span>Due date</span><span>Amount</span><span>Status</span></div>{invoices.map(i=><div className="data-row" key={i.id}><div><strong>{i.id}</strong><span>{i.vendor}</span></div><span>{new Date(i.due+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span><strong>{money(i.amount)}</strong><span className={`status-pill ${i.status==="Overdue"?"failed":"completed"}`}>{i.status}</span></div>)}</div></div><div className="panel"><div className="panel-heading"><div><h2>Finance records created in this session</h2><p>Approved writes are read back for field-level verification.</p></div><span className="table-count">{financeRecords.length} records</span></div>{financeRecords.length ? <div className="data-table"><div className="data-row data-head"><span>Record / vendor</span><span>Due date</span><span>Amount</span><span>Status</span></div>{financeRecords.map(r=><div className="data-row" key={r.id}><div><strong>{r.id}</strong><span>{r.vendor}</span></div><span>{r.due}</span><strong>{money(r.amount)}</strong><span className="status-pill completed">Verified</span></div>)}</div> : <div className="empty-state"><strong>No approved finance writes yet</strong><p>Approve an invoice task to create a session record and verify it.</p></div>}</div><div className="panel data-note"><ShieldCheck size={18}/><div><strong>Safe demo environment</strong><p>These are fictional records. Approved writes are held in client session state and reset on refresh. No real financial systems or third-party accounts are connected.</p></div></div></>}
        {section==="Execution logs" && <><div className="page-heading"><div><div className="eyebrow"><Terminal size={14}/> OBSERVABILITY</div><h1>Execution logs</h1><p>Inspect what the agent actually observed and decided.</p></div></div><div className="panel"><div className="panel-heading"><div><h2>Recent audit events</h2><p>Events captured by the current browser session.</p></div><span className="live-pill"><span className="live-dot"/> Updated</span></div>{tasks.flatMap(t=>t.logs.map((log,i)=>({task:t,log,i}))).length?tasks.flatMap(t=>t.logs.map((log,i)=>({task:t,log,i}))).map((x,i)=><div className="audit-row" key={x.task.id+"-"+i}><span className="audit-mark"><Activity size={14}/></span><div><strong>{x.log}</strong><p>{x.task.id} · {x.task.title}</p></div><span className="audit-status">{x.task.status.replace("_"," ")}</span></div>):<div className="empty-state">No audit events yet.</div>}</div></>}
        {section==="Settings" && <><div className="page-heading"><div><div className="eyebrow"><Settings2 size={14}/> CONFIGURATION</div><h1>Settings</h1><p>Understand what is enabled in this prototype.</p></div></div><div className="settings-grid"><div className="panel setting-card"><div className="setting-icon"><Bot size={19}/></div><h3>Agent runtime</h3><p>Deterministic planner and bounded task execution for supported demo workflows.</p><span className="setting-state"><CheckCircle2 size={14}/> Enabled</span></div><div className="panel setting-card"><div className="setting-icon"><LockKeyhole size={19}/></div><h3>Approval policy</h3><p>Finance writes and support draft saves pause until an explicit approval decision.</p><span className="setting-state"><CheckCircle2 size={14}/> Enforced in demo flow</span></div><div className="panel setting-card"><div className="setting-icon"><Sparkles size={19}/></div><h3>LLM provider</h3><p>Optional. This starter does not call an external model unless an adapter is implemented.</p><span className="setting-state neutral-state">Not configured</span></div><div className="panel setting-card"><div className="setting-icon"><Activity size={19}/></div><h3>Persistence</h3><p>Approved writes are stored in session-local React state and reset on refresh. Add a managed database before multi-user deployment.</p><span className="setting-state neutral-state">Prototype storage</span></div></div></>}
      </div>
      <footer className="footer"><span>© 2026 CentrAlign AI · Prototype</span><span><span className="live-dot"/> Systems operational</span></footer>
    </section>
  </main>;
}
function Metric({title,value,change,icon:Icon,tone,sub}:{title:string;value:string;change:string;icon:any;tone:string;sub:string}){
 return <div className="metric-card"><div className="metric-top"><span>{title}</span><div className={`metric-icon ${tone}`}><Icon size={18}/></div></div><div className="metric-value">{value}</div><div className="metric-bottom"><span className={`metric-change ${tone}`}>{change.includes("%")&&<ArrowUpRight size={13}/>} {change}</span><span>{sub}</span></div></div>;
}
function TaskList({tasks,onSelect}:{tasks:Task[];onSelect:(t:Task)=>void}){
 return <div className="task-list">{tasks.map(t=><button className="task-row" key={t.id} onClick={()=>onSelect(t)}><div className={`task-row-icon ${t.status}`}><FileText size={17}/></div><div className="task-row-main"><strong>{t.title}</strong><span>{t.id} · {t.createdAt}</span></div><span className={`status-pill ${t.status}`}>{t.status.replace("_"," ")}</span><ArrowDownRight size={15} className="row-arrow"/></button>)}</div>;
}