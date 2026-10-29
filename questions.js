
const cpuQuestions = [
    {
        question: "What does CPU stand for?",
        options: [
            "Central Processing Unit",
            "Computer Processing Utility",
            "Central Program Unit",
            "Computer Power Unit"
        ],
        correctAnswer: 0,
        explanation: "CPU stands for Central Processing Unit. It executes instructions and processes data."
    },
    {
        question: "What is the main purpose of the ALU?",
        options: [
            "Store files permanently",
            "Perform arithmetic and logical operations",
            "Control the computer's display",
            "Connect to the internet"
        ],
        correctAnswer: 1,
        explanation: "The ALU performs arithmetic operations like addition and logical operations like AND and OR."
    },
    {
        question: "What does the Control Unit do?",
        options: [
            "Stores all computer files",
            "Displays images on the monitor",
            "Directs and coordinates CPU operations",
            "Provides power to the CPU"
        ],
        correctAnswer: 2,
        explanation: "The Control Unit directs CPU operations by controlling how instructions are executed."
    }
];

cpuQuestions.push(
 {question:"Which register holds the address of the next instruction?",options:["Instruction Register","Program Counter","Accumulator","Memory Data Register"],correctAnswer:1,explanation:"The Program Counter tracks the address of the next instruction to fetch."},
 {question:"Which sequence describes the basic instruction cycle?",options:["Decode, store, fetch","Execute, fetch, compile","Fetch, decode, execute","Store, compile, execute"],correctAnswer:2,explanation:"The CPU fetches an instruction, decodes it, and executes it."},
 {question:"Why does a CPU use cache memory?",options:["To replace all RAM","To permanently store documents","To cool the processor","To quickly access frequently used data and instructions"],correctAnswer:3,explanation:"Cache is small, fast memory that reduces the time spent accessing frequently used data and instructions."},
 {question:"What does a CPU clock rate measure?",options:["Clock cycles per second","Instructions stored on disk","Bytes in a register","Number of CPU cores"],correctAnswer:0,explanation:"Clock rate is measured in hertz: cycles per second. One cycle does not necessarily equal one instruction."},
 {question:"What is a CPU register?",options:["A permanent file on disk","A small, fast storage location inside the CPU","A network connection","An external power supply"],correctAnswer:1,explanation:"Registers hold small amounts of data, addresses, or instructions directly inside the CPU."},
 {question:"What is an interrupt used for?",options:["Deleting the current program","Increasing disk space","Requesting CPU attention for an event","Disabling all memory"],correctAnswer:2,explanation:"An interrupt signals an event that needs attention, allowing the CPU to execute an appropriate handler."},
 {question:"What does instruction pipelining allow?",options:["Overlapping stages of multiple instructions","Removing the need for memory","Executing only one instruction per minute","Storing all instructions in the ALU"],correctAnswer:0,explanation:"Pipelining overlaps stages such as fetching, decoding, and executing different instructions to improve throughput."}
);
