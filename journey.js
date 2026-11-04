const cpuStages=[
{name:'CPU',color:'#a8ffd5',lesson:'The Central Processing Unit executes program instructions. To get home, you must travel through its components and learn how they work together.',ids:[0,4],landmark:'FETCH / DECODE / EXECUTE'},
{name:'CONTROL UNIT',color:'#ffd76e',lesson:'The conductor of the machine. The Control Unit decodes instructions and coordinates the signals that tell other components what to do.',ids:[2,4,8],landmark:'DECODE / DIRECT / COORDINATE'},
{name:'REGISTERS',color:'#b6c9ff',lesson:'Tiny storage. Immediate access. Registers hold data, addresses, and instructions being used right now. The Program Counter holds the next instruction address.',ids:[3,7],landmark:'HOLD / ADDRESS / REMEMBER'},
{name:'ALU',color:'#ffd59a',lesson:'The Arithmetic Logic Unit performs calculations and logic: addition, subtraction, comparisons, AND, and OR.',ids:[1,10],landmark:'ADD / COMPARE / COMPUTE'},
{name:'CACHE',color:'#e6adff',lesson:'Cache is small, fast memory near or inside the CPU. It keeps copies of frequently used data and instructions, reducing slower RAM accesses.',ids:[5,11],landmark:'KEEP CLOSE / ACCESS FAST'},
{name:'CLOCK',color:'#ff9db5',lesson:'The clock synchronizes CPU operations. Hertz means cycles per second; a cycle does not always complete one instruction.',ids:[6,12],landmark:'TICK / SYNCHRONIZE / REPEAT'}];

// Topic names keep each level linked to its own question bank as it grows.
const stageBackgrounds=['#123e32','#493915','#172f57','#51291b','#382052','#4e2037'];
cpuStages.forEach((stage,index)=>{
 stage.background=stageBackgrounds[index];
 stage.ids=cpuQuestions.map((q,i)=>q.topic===stage.name?i:-1).filter(i=>i>=0);
});
