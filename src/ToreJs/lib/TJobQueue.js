/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20231202
  Author	: 	İhsan V. Töre
  About		: 	TJobQueue.js: Tore Js job queue component base classes.
  License 	: 	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, exc, log} from "./TSystem.js";
import { TComponent } from "./TComponent.js";


/*——————————————————————————————————————————————————————————————————————————— 
  CLASS: TJobQueue.
  TASKS:
    *   This is an abstract class to build subclasses defining the basic 
        structure of a job queue as an abstraction. Job queues may differ
        extensively by their types and inner structure. 
    *   How they work depends on the job type and parameters needed.
    *   Most of them must not be destroyed. So beware.
    *   You can find two example job queue classes in ctl/TCtlSys.js. 
———————————————————————————————————————————————————————————————————————————*/
const E_NI = 'E_NOT_IMPLEMENTED';

export class TJobQueue extends TComponent {

    // Job queues does not allow members.
    static allowMemberClass = null;
    
    static cdta = { 
        logging: {value: false},
        cyclic: {value: false}
    }

    _jobLst = [];
    _active = false;    // true when job queue cycle is active.
    _logEna = false;    // true when logging enabled.
    _cyclic = false;    // Consumption of all jobs enabled.
                        // During execution, new jobs can be added.
                        // When true, execution keeps running until
                        // no new jobs left. Must effect only execute().
    
    /*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TJobQueue component.
	  ARGS: name      : string	  : Name of new job queue :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null) {
		super(name, owner);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	start.
	  TASK:	Starts the queue cycle.
	  RETV: 		: Boolean	 : True when job queue is active.
      INFO: Start function enables the job execution.
            Job dependent. Use to start an event cycle like timer 
            to trigger execution of jobs. 
            this._active is controlled and set only here and at stop.
	——————————————————————————————————————————————————————————————————————————*/
	start() {
        exc(E_NI, this.class.name + '.start()');
	}
    
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	stop.
	  TASK:	Suspends the queue cycle.
	  RETV: 		: Boolean	 : True on success
      INFO: Stop function disables the job execution.
            Job dependent. Use to stopping or ignoring an event cycle 
            like timer to trigger execution of jobs. 
            this._active is controlled and set only here and at start.
	——————————————————————————————————————————————————————————————————————————*/
	stop() {
        exc(E_NI, this.class.name + '.stop()');
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	add.
	  TASK:	Adds a job to queue.
	  RETV: 		: Boolean	 : True on success
      INFO: Implementation dependent.
            Some queues autostart when the first job is added etc.
            Jobs may come with diverse parameters, like timing, repeating etc. 
	——————————————————————————————————————————————————————————————————————————*/
    add() {
        exc(E_NI, this.class.name + '.add()');
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	del.
	  TASK:	Deletes a job from queue.
	  RETV: 		: Boolean	 : True on success
      INFO: Implementation dependent.
            Not recommended for most of the job queues. 
            If a job queue to support this, it is better for jobs to have
            identifiers, otherwise finding them will be a cpu intensive
            task starving processor time.   
	——————————————————————————————————————————————————————————————————————————*/
    del() {
        exc(E_NI, this.class.name + '.del()');
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	executeJob.
	  TASK:	Executes First job in the queue.
      INFO: Implementation dependent.
	——————————————————————————————————————————————————————————————————————————*/
    executeJob() {
        exc(E_NI, this.class.name + '.executeJob()');
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	execute
	  TASK:	Executes all jobs in the queue.
            If cyclic = true new jobs added during the cycle are executed too.
            If cyclic = false just makes a single pass execution.
      INFO: Implementation dependent.
            Do not forget handling this._cyclic.
	——————————————————————————————————————————————————————————————————————————*/
    execute() {
        exc(E_NI, this.class.name + '.execute()');
    }

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	logging : Boolean
	  GET :	Returns true if logging is enabled.
      SET : Sets logging status.
	——————————————————————————————————————————————————————————————————————————*/
    get logging() {
        return this._logEna;
    }

    set logging(val = false) {
        val = !!val;
        if (val === this._logEna)
            return;
        this._logEna = val;
        log(this.namePath, "logging is", val ? "enabled." : "disabled.")

    }

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	cyclic : Boolean
	  GET :	Returns true if full job consumption enabled.
      SET : Sets full job consumption status.
	  INFO: During execution pass, normally job list contents are moved to 
            a local list then job list is reset. So job list can accept new
            jobs. When cyclic is true, execute must loop if new jobs are 
            added to job list, until no new jobs left.
	——————————————————————————————————————————————————————————————————————————*/
    get cyclic() {
        return this._cyclic;
    }

    set cyclic(val = false) {
        val = !!val;
        if (val === this._cyclic)
            return;
        this._cyclic = val;
        if (this._log)
            log("cyclic is", val ? "enabled." : "disabled.")

    }

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	length : int
	  GET :	Returns the number of jobs in the queue.
	——————————————————————————————————————————————————————————————————————————*/
    get length() {
        return this._jobLst.length;
    }

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	empty : Boolean
	  GET :	Returns true if there are no jobs in the queue.
	——————————————————————————————————————————————————————————————————————————*/
    get empty() {
        return this._jobLst.length === 0;
    }

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	hasJobs : Boolean
	  GET :	Returns true if there is any job in the queue.
	——————————————————————————————————————————————————————————————————————————*/
    get hasJobs() {
        return this._jobLst.length > 0;
    }

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	active : Boolean
	  GET :	Returns true if job queue is in cycle.
	——————————————————————————————————————————————————————————————————————————*/
    get active() {
        return this._active;
    }
}

/*——————————————————————————————————————————————————————————————————————————— 
  CLASS: TSimpleFunctionQueue.
  TASKS:
    This is a job queue template to accept function calls. 
———————————————————————————————————————————————————————————————————————————*/
export class TFuncJobQueue extends TJobQueue {
  
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	add.
	  TASK:	Adds a function to job queue.
      ARGS: inst    : Object    : object instance to bind function call.
            func    : Function  : function to call.
            args    : Array     : arguments to pass to function.
	  RETV: 		: Boolean	: True on success 
	——————————————————————————————————————————————————————————————————————————*/

    add(inst = null, func = null, args = null) {
        if (!(func instanceof Function))
            return false;
        this._jobLst.push({i: inst, f: func, a: args})
        this.start(); 
        return true;       
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	executeJob.
	  TASK:	Executes First function in the queue.
	——————————————————————————————————————————————————————————————————————————*/
    executeJob() {
        var t = this,
            f;
        
        if (t._jobLst.length === 0)
            return;
        f = t._jobLst.splice(0, 1)[0];
        f.f.apply(f.i, f.a);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	execute.
	  TASK:	Executes all functions in the queue.
            If cyclic = true new jobs added during the cycle are executed too.
            If cyclic = false just makes a single pass execution.
	——————————————————————————————————————————————————————————————————————————*/
    execute() {
        var t = this,   // queue.
            l,          // list of function descriptor objects.
            f,          // function descriptor object.
            s,          // start time for logging.
            i,          // iteration counter for logging.
            r;          // report for logging.

        if (t._logEna) {
            s = performance.now();
            i = 0;
            r = '';
        }            
        while(t._jobLst.length > 0) {
            l = t._jobLst;
            t._jobLst = [];
            for(f of l)
                f.f.apply(f.i, f.a);
            if (t._logEna) {
                r += '['+ l.length +'] '
                i++;
            }
            if (!t._cyclic)
                break;
        }
        if (t._logEna)
            log(r, 'i:', i, 't:', performance.now() - s);
        t.stop();
    }
}

sys.registerClass(TJobQueue);
sys.registerClass(TFuncJobQueue);




