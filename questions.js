// Original practice questions inspired by the supplied CPU lecture topics.
const cpuQuestions = [
  {
    "topic": "CPU",
    "question": "What is the CPU primarily responsible for?",
    "options": [
      "Executing program instructions",
      "Permanently storing files",
      "Supplying electrical power",
      "Displaying every pixel"
    ],
    "correctAnswer": 0,
    "explanation": "The CPU executes instructions and coordinates processing."
  },
  {
    "topic": "CPU",
    "question": "What does CPU stand for?",
    "options": [
      "Cache Processing Utility",
      "Central Processing Unit",
      "Computer Program Utility",
      "Central Peripheral Unit"
    ],
    "correctAnswer": 1,
    "explanation": "CPU means Central Processing Unit."
  },
  {
    "topic": "CPU",
    "question": "Which design stores instructions and data in the same memory?",
    "options": [
      "A display pipeline",
      "A network topology",
      "Von Neumann",
      "Harvard"
    ],
    "correctAnswer": 2,
    "explanation": "The von Neumann model uses shared memory for instructions and data."
  },
  {
    "topic": "CPU",
    "question": "What distinguishes the Harvard memory model?",
    "options": [
      "No instruction memory",
      "All storage is on disk",
      "Only decimal arithmetic",
      "Separate instruction and data memories"
    ],
    "correctAnswer": 3,
    "explanation": "Harvard separates instruction and data memories and their access paths."
  },
  {
    "topic": "CPU",
    "question": "What does a microcontroller typically integrate?",
    "options": [
      "CPU, memory, and I/O on one chip",
      "Only a graphics display",
      "Only external RAM",
      "Only a power supply"
    ],
    "correctAnswer": 0,
    "explanation": "Microcontrollers combine processing, memory, and peripherals for embedded tasks."
  },
  {
    "topic": "CPU",
    "question": "Which task is a typical microcontroller application?",
    "options": [
      "Hosting a large search engine",
      "Controlling a washing machine",
      "Archiving a data center",
      "Rendering a cinema film offline"
    ],
    "correctAnswer": 1,
    "explanation": "Embedded controllers are suited to dedicated control tasks in appliances."
  },
  {
    "topic": "CPU",
    "question": "What does a quad-core processor contain?",
    "options": [
      "Four clock cycles total",
      "Four instruction sets necessarily",
      "Four physical processing cores",
      "Four bytes of cache"
    ],
    "correctAnswer": 2,
    "explanation": "Quad-core refers to four physical cores."
  },
  {
    "topic": "CPU",
    "question": "What is a benefit of multiple CPU cores?",
    "options": [
      "Making every program four times faster",
      "Eliminating all memory access",
      "Replacing the operating system",
      "Running suitable workloads in parallel"
    ],
    "correctAnswer": 3,
    "explanation": "Work that can be divided among cores can benefit from parallel processing."
  },
  {
    "topic": "CPU",
    "question": "What does ISA stand for?",
    "options": [
      "Instruction Set Architecture",
      "Integrated Storage Array",
      "Internal Signal Amplifier",
      "Instruction Speed Average"
    ],
    "correctAnswer": 0,
    "explanation": "An ISA defines the machine-level interface presented to software."
  },
  {
    "topic": "CPU",
    "question": "Which is defined by an ISA?",
    "options": [
      "The computer case dimensions",
      "Available machine instructions",
      "The color of the motherboard",
      "The fan blade count"
    ],
    "correctAnswer": 1,
    "explanation": "An ISA specifies instructions, registers, and other programmer-visible behavior."
  },
  {
    "topic": "CPU",
    "question": "Assembly language is best described as what?",
    "options": [
      "A CPU cooling method",
      "A type of permanent memory",
      "Human-readable notation for machine instructions",
      "A universal web language"
    ],
    "correctAnswer": 2,
    "explanation": "Assembly uses symbolic instructions associated with a particular ISA."
  },
  {
    "topic": "CPU",
    "question": "Which is an example of an instruction set architecture?",
    "options": [
      "DDR memory",
      "USB cable",
      "SSD storage",
      "RISC-V"
    ],
    "correctAnswer": 3,
    "explanation": "RISC-V is an ISA; memory and connection technologies serve other roles."
  },
  {
    "topic": "CPU",
    "question": "What connects a CPU physically to a compatible motherboard?",
    "options": [
      "Its socket",
      "Its browser cache",
      "Its file extension",
      "Its instruction operand"
    ],
    "correctAnswer": 0,
    "explanation": "The socket is the physical CPU interface on the motherboard."
  },
  {
    "topic": "CPU",
    "question": "Which unit specializes in neural-network computation?",
    "options": [
      "Address register",
      "NPU",
      "Program Counter",
      "Clock generator"
    ],
    "correctAnswer": 1,
    "explanation": "An NPU accelerates workloads involving neural-network operations."
  },
  {
    "topic": "CPU",
    "question": "Which description fits a microprocessor in a basic system?",
    "options": [
      "A storage device with no processor",
      "A device that only converts audio",
      "A processor working with memory and peripherals",
      "A complete appliance without any other components"
    ],
    "correctAnswer": 2,
    "explanation": "A microprocessor provides computation and works with the rest of the system."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What is the main role of the Control Unit?",
    "options": [
      "Storing files permanently",
      "Generating images exclusively",
      "Providing mains power",
      "Coordinating CPU operations"
    ],
    "correctAnswer": 3,
    "explanation": "The CU coordinates instruction execution and component activity."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What is the usual basic instruction-cycle order?",
    "options": [
      "Fetch, decode, execute",
      "Execute, compile, fetch",
      "Decode, save, compile",
      "Store, reboot, fetch"
    ],
    "correctAnswer": 0,
    "explanation": "The CPU retrieves an instruction, interprets it, and performs it."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What happens during fetch?",
    "options": [
      "The CPU is powered off",
      "The next instruction is retrieved",
      "All registers are cleared",
      "The program is compiled"
    ],
    "correctAnswer": 1,
    "explanation": "Fetching brings an instruction from cache or memory into the CPU."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What happens during decode?",
    "options": [
      "The disk is formatted",
      "The clock is removed",
      "The instruction operation and operands are interpreted",
      "The result is printed automatically"
    ],
    "correctAnswer": 2,
    "explanation": "Decoding identifies what operation to perform and which operands it uses."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What happens during execute?",
    "options": [
      "Source code is always compiled",
      "The next program is installed",
      "All cache entries are deleted",
      "The requested operation is performed"
    ],
    "correctAnswer": 3,
    "explanation": "Execution carries out the operation, such as arithmetic or a memory access."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What does the instruction decoder interpret?",
    "options": [
      "The bit pattern of an instruction",
      "The computer case label",
      "A monitor brightness setting",
      "A fan speed sticker"
    ],
    "correctAnswer": 0,
    "explanation": "The decoder interprets encoded instructions and helps produce control signals."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What does an opcode identify?",
    "options": [
      "The color of a register",
      "The operation an instruction requests",
      "The number of fans",
      "The length of a power cable"
    ],
    "correctAnswer": 1,
    "explanation": "The opcode specifies the instruction operation."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What does an instruction operand specify?",
    "options": [
      "Only the manufacturer name",
      "Only the clock voltage",
      "Data or a location used by the operation",
      "Only the CPU temperature"
    ],
    "correctAnswer": 2,
    "explanation": "Operands identify values or locations involved in an operation."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "Which signals tell registers when to accept new data?",
    "options": [
      "Sound waves",
      "Display pixels",
      "Cooling signals",
      "Control signals"
    ],
    "correctAnswer": 3,
    "explanation": "The control logic coordinates register reads, writes, and data movement."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "Which component tells the ALU which operation to perform?",
    "options": [
      "Control logic in the CU",
      "The SSD enclosure",
      "The monitor cable",
      "The fan controller"
    ],
    "correctAnswer": 0,
    "explanation": "The CU derives ALU control information from the instruction."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What is write-back in an instruction cycle?",
    "options": [
      "Restarting the operating system",
      "Saving an execution result to its destination",
      "Deleting the instruction set",
      "Sending a product back"
    ],
    "correctAnswer": 1,
    "explanation": "Write-back stores a result in the destination specified by the instruction."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What does a branch instruction change?",
    "options": [
      "The screen size",
      "The number of power pins",
      "The program control flow",
      "The physical socket"
    ],
    "correctAnswer": 2,
    "explanation": "A branch can redirect which instruction executes next."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What is the purpose of an interrupt?",
    "options": [
      "Erasing all program memory",
      "Increasing disk capacity",
      "Disabling the ISA",
      "Requesting attention for an event"
    ],
    "correctAnswer": 3,
    "explanation": "Interrupts allow the processor to handle events through appropriate handlers."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What does a branch predictor try to forecast?",
    "options": [
      "A branch outcome or target",
      "The next user password",
      "The monitor resolution",
      "The hard-drive model"
    ],
    "correctAnswer": 0,
    "explanation": "Branch prediction anticipates control flow before a branch is fully resolved."
  },
  {
    "topic": "CONTROL UNIT",
    "question": "What does the Bus Interface Unit help manage?",
    "options": [
      "Permanent file names",
      "Transfers between the CPU and other components",
      "Floating-point multiplication only",
      "The brightness of the screen"
    ],
    "correctAnswer": 1,
    "explanation": "The BIU manages communication with memory and other system components."
  },
  {
    "topic": "REGISTERS",
    "question": "What is a CPU register?",
    "options": [
      "An external network port",
      "A cooling component",
      "A small fast storage location in the CPU",
      "A permanent file on an SSD"
    ],
    "correctAnswer": 2,
    "explanation": "Registers hold values needed during instruction execution."
  },
  {
    "topic": "REGISTERS",
    "question": "Which register tracks the next instruction address?",
    "options": [
      "A browser cookie",
      "A cache directory",
      "A power register on the monitor",
      "Program Counter"
    ],
    "correctAnswer": 3,
    "explanation": "The Program Counter identifies the next instruction to fetch."
  },
  {
    "topic": "REGISTERS",
    "question": "What kind of information can registers hold?",
    "options": [
      "Data, instructions, or addresses",
      "Only image files",
      "Only complete operating systems",
      "Only temperatures"
    ],
    "correctAnswer": 0,
    "explanation": "Different registers hold operands, addresses, instructions, and control information."
  },
  {
    "topic": "REGISTERS",
    "question": "What are general-purpose registers used for?",
    "options": [
      "Producing clock pulses",
      "Operands and temporary results",
      "Permanent backups",
      "Network routing outside the CPU"
    ],
    "correctAnswer": 1,
    "explanation": "General-purpose registers supply working values for instructions."
  },
  {
    "topic": "REGISTERS",
    "question": "What is an address register intended to hold?",
    "options": [
      "A complete disk backup",
      "An audio waveform only",
      "A memory address",
      "A screen color only"
    ],
    "correctAnswer": 2,
    "explanation": "Address registers identify memory locations."
  },
  {
    "topic": "REGISTERS",
    "question": "What do control registers help configure?",
    "options": [
      "Only wallpaper images",
      "Only mouse sensitivity",
      "Only storage filenames",
      "Processor behavior and operating modes"
    ],
    "correctAnswer": 3,
    "explanation": "Control registers hold settings related to processor operation and protection."
  },
  {
    "topic": "REGISTERS",
    "question": "What are floating-point registers designed to hold?",
    "options": [
      "Floating-point operands and results",
      "Only program filenames",
      "Only cooling settings",
      "Only network addresses"
    ],
    "correctAnswer": 0,
    "explanation": "Floating-point registers support operations on floating-point values."
  },
  {
    "topic": "REGISTERS",
    "question": "Which is generally fastest for immediate CPU operands?",
    "options": [
      "An SSD",
      "Registers",
      "L3 cache",
      "Main memory"
    ],
    "correctAnswer": 1,
    "explanation": "Registers are directly available to execution units and are at the fast end of the hierarchy."
  },
  {
    "topic": "REGISTERS",
    "question": "How do registers differ from cache?",
    "options": [
      "Cache is always faster than registers",
      "Registers are permanent storage",
      "Registers hold immediate working values; cache holds memory copies",
      "Registers are larger than RAM"
    ],
    "correctAnswer": 2,
    "explanation": "Registers and cache both speed work but serve different roles."
  },
  {
    "topic": "REGISTERS",
    "question": "Why keep an intermediate result in a register?",
    "options": [
      "It becomes a permanent backup",
      "It increases the screen resolution",
      "It eliminates every later instruction",
      "It can be reused quickly by another instruction"
    ],
    "correctAnswer": 3,
    "explanation": "Registers avoid unnecessary trips to slower storage for working values."
  },
  {
    "topic": "REGISTERS",
    "question": "An instruction adds two register operands. Where are its input values?",
    "options": [
      "In CPU registers",
      "Only on a DVD",
      "Only in the power supply",
      "Only in a browser cache"
    ],
    "correctAnswer": 0,
    "explanation": "Register operands provide values held in the CPU register set."
  },
  {
    "topic": "REGISTERS",
    "question": "What happens to the Program Counter after a taken branch?",
    "options": [
      "It stores the entire program",
      "It is redirected to the branch target",
      "It becomes the fan speed",
      "It always resets to zero"
    ],
    "correctAnswer": 1,
    "explanation": "A taken branch changes the address used for subsequent instruction fetching."
  },
  {
    "topic": "REGISTERS",
    "question": "A pointer to data most directly represents what?",
    "options": [
      "A cache capacity",
      "A processor socket",
      "An address",
      "A clock pulse"
    ],
    "correctAnswer": 2,
    "explanation": "Pointers identify locations and can be held in registers."
  },
  {
    "topic": "REGISTERS",
    "question": "Why are registers small compared with RAM?",
    "options": [
      "They must store every installed application",
      "They are removable disk drives",
      "They only store sound",
      "They provide a limited set of very fast working locations"
    ],
    "correctAnswer": 3,
    "explanation": "A register file prioritizes fast access for execution over bulk capacity."
  },
  {
    "topic": "REGISTERS",
    "question": "Does storing a result in a register make it survive power loss?",
    "options": [
      "No, ordinary CPU registers are volatile",
      "Yes, all registers are permanent",
      "Only if the result is even",
      "Only if the clock is fast"
    ],
    "correctAnswer": 0,
    "explanation": "Ordinary processor registers lose their state when power is removed."
  },
  {
    "topic": "ALU",
    "question": "What does ALU stand for?",
    "options": [
      "Application Link Utility",
      "Arithmetic Logic Unit",
      "Address Loading Utility",
      "Automatic Latency Unit"
    ],
    "correctAnswer": 1,
    "explanation": "The ALU performs arithmetic and logical operations."
  },
  {
    "topic": "ALU",
    "question": "Which operation is an arithmetic task for the ALU?",
    "options": [
      "Saving a browser bookmark",
      "Generating mains power",
      "Adding two integers",
      "Cooling a core"
    ],
    "correctAnswer": 2,
    "explanation": "Addition is a basic arithmetic operation."
  },
  {
    "topic": "ALU",
    "question": "Which operation is a logical task?",
    "options": [
      "Spinning a fan",
      "Connecting a keyboard",
      "Storing a file forever",
      "Bitwise AND"
    ],
    "correctAnswer": 3,
    "explanation": "Logical operations manipulate or compare bits and values."
  },
  {
    "topic": "ALU",
    "question": "What is the result of binary 1010 AND 1100?",
    "options": [
      "1000",
      "1110",
      "0110",
      "0001"
    ],
    "correctAnswer": 0,
    "explanation": "AND produces a one only where both input bits are one."
  },
  {
    "topic": "ALU",
    "question": "What is the result of binary 1010 OR 1100?",
    "options": [
      "0010",
      "1110",
      "1000",
      "0000"
    ],
    "correctAnswer": 1,
    "explanation": "OR produces a one wherever at least one input bit is one."
  },
  {
    "topic": "ALU",
    "question": "What is the result of binary 1010 XOR 1100?",
    "options": [
      "1000",
      "1111",
      "0110",
      "1110"
    ],
    "correctAnswer": 2,
    "explanation": "XOR produces a one where the input bits differ."
  },
  {
    "topic": "ALU",
    "question": "What is the result of adding binary 0011 and 0001?",
    "options": [
      "0010",
      "0111",
      "0000",
      "0100"
    ],
    "correctAnswer": 3,
    "explanation": "Binary three plus one equals binary four."
  },
  {
    "topic": "ALU",
    "question": "Which ALU operation helps test whether two values are equal?",
    "options": [
      "Comparison",
      "Instruction fetching",
      "Cache replacement",
      "Socket selection"
    ],
    "correctAnswer": 0,
    "explanation": "Comparisons support decisions about relationships between values."
  },
  {
    "topic": "ALU",
    "question": "For a 4-bit value, what is NOT 0101?",
    "options": [
      "0000",
      "1010",
      "0101",
      "1111"
    ],
    "correctAnswer": 1,
    "explanation": "Bitwise NOT flips each bit within the specified width."
  },
  {
    "topic": "ALU",
    "question": "What is 0011 shifted left by one bit in a 4-bit result?",
    "options": [
      "1100",
      "0011",
      "0110",
      "0001"
    ],
    "correctAnswer": 2,
    "explanation": "A logical left shift moves bits left and inserts zero on the right."
  },
  {
    "topic": "ALU",
    "question": "What is 1000 shifted right logically by one bit?",
    "options": [
      "1100",
      "0001",
      "1000",
      "0100"
    ],
    "correctAnswer": 3,
    "explanation": "A logical right shift inserts zero at the left."
  },
  {
    "topic": "ALU",
    "question": "Which component specializes in floating-point arithmetic?",
    "options": [
      "FPU",
      "Program Counter",
      "Bus connector",
      "Clock generator"
    ],
    "correctAnswer": 0,
    "explanation": "The FPU handles operations on floating-point values."
  },
  {
    "topic": "ALU",
    "question": "Which operation most directly checks whether A is less than B?",
    "options": [
      "A clock tick alone",
      "A comparison",
      "A cache hit",
      "An instruction fetch"
    ],
    "correctAnswer": 1,
    "explanation": "A comparison determines the relationship between two operands."
  },
  {
    "topic": "ALU",
    "question": "What is the result of decimal 9 minus 4?",
    "options": [
      "4",
      "36",
      "5",
      "13"
    ],
    "correctAnswer": 2,
    "explanation": "Subtraction is an arithmetic operation that the execution hardware can perform."
  },
  {
    "topic": "ALU",
    "question": "What supplies working operands to the ALU in many instructions?",
    "options": [
      "The computer case",
      "The display backlight",
      "The power cable",
      "CPU registers"
    ],
    "correctAnswer": 3,
    "explanation": "Registers commonly provide input values and receive execution results."
  },
  {
    "topic": "CACHE",
    "question": "Why does a CPU use cache?",
    "options": [
      "To reduce average memory access delay",
      "To replace every register",
      "To cool the processor",
      "To store files permanently"
    ],
    "correctAnswer": 0,
    "explanation": "Cache keeps useful memory contents close to execution units."
  },
  {
    "topic": "CACHE",
    "question": "What is a cache hit?",
    "options": [
      "Reaching the end of a program",
      "Finding requested data in cache",
      "Losing data during shutdown",
      "Executing an invalid instruction"
    ],
    "correctAnswer": 1,
    "explanation": "A hit avoids retrieving that data from a slower level."
  },
  {
    "topic": "CACHE",
    "question": "What is a cache miss?",
    "options": [
      "A broken keyboard",
      "A stopped clock",
      "Requested data is absent from the checked cache",
      "A successful register addition"
    ],
    "correctAnswer": 2,
    "explanation": "A miss requires checking another level or fetching from memory."
  },
  {
    "topic": "CACHE",
    "question": "Which cache level is generally closest and fastest?",
    "options": [
      "L2",
      "L3",
      "An SSD",
      "L1"
    ],
    "correctAnswer": 3,
    "explanation": "L1 prioritizes low access latency near a core."
  },
  {
    "topic": "CACHE",
    "question": "Compared with L1, L2 cache is typically what?",
    "options": [
      "Larger but slower",
      "Smaller and always faster",
      "Permanent storage",
      "Outside the memory hierarchy"
    ],
    "correctAnswer": 0,
    "explanation": "Higher cache levels trade some speed for greater capacity."
  },
  {
    "topic": "CACHE",
    "question": "Which cache level is commonly shared among multiple cores?",
    "options": [
      "The instruction decoder",
      "L3",
      "Every register",
      "The Program Counter"
    ],
    "correctAnswer": 1,
    "explanation": "L3 often serves as a shared last-level cache, depending on the design."
  },
  {
    "topic": "CACHE",
    "question": "Which order goes from faster to slower in a typical hierarchy?",
    "options": [
      "RAM, SSD, registers, L1",
      "L1, SSD, registers, RAM",
      "Registers, L1, RAM, SSD",
      "SSD, RAM, L1, registers"
    ],
    "correctAnswer": 2,
    "explanation": "Storage closer to execution is generally smaller and faster."
  },
  {
    "topic": "CACHE",
    "question": "Why organize cache into multiple levels?",
    "options": [
      "To eliminate all data transfer",
      "To make every level identical",
      "To store only websites",
      "To balance capacity, latency, and cost"
    ],
    "correctAnswer": 3,
    "explanation": "A hierarchy combines a small fast level with larger supporting levels."
  },
  {
    "topic": "CACHE",
    "question": "What kind of memory is commonly used for CPU cache?",
    "options": [
      "SRAM",
      "A magnetic tape",
      "An optical disc",
      "A mechanical hard disk"
    ],
    "correctAnswer": 0,
    "explanation": "SRAM is commonly used for CPU caches; main memory typically uses DRAM."
  },
  {
    "topic": "CACHE",
    "question": "What kind of memory is commonly used for main RAM?",
    "options": [
      "Only CPU registers",
      "DRAM",
      "An optical disc",
      "A paper tape"
    ],
    "correctAnswer": 1,
    "explanation": "DRAM offers the capacity used for typical system main memory."
  },
  {
    "topic": "CACHE",
    "question": "Is CPU cache the same thing as browser cache?",
    "options": [
      "Yes, both only store web pages",
      "No, browser cache is an ALU",
      "No, they cache different kinds of contents for different systems",
      "Yes, both are the CPU register file"
    ],
    "correctAnswer": 2,
    "explanation": "CPU cache accelerates processor memory access; browser cache reuses web resources."
  },
  {
    "topic": "CACHE",
    "question": "Which workload benefits from reusing cached data?",
    "options": [
      "Reading an unlimited stream once with no reuse",
      "Keeping the CPU powered off",
      "Removing all memory",
      "Repeatedly accessing a small working set"
    ],
    "correctAnswer": 3,
    "explanation": "Reusing a working set can avoid repeated slower memory accesses."
  },
  {
    "topic": "CACHE",
    "question": "What usually happens after an L1 miss?",
    "options": [
      "The system checks a lower cache level or memory",
      "The operating system must always restart",
      "The ALU becomes permanent storage",
      "Every register is erased"
    ],
    "correctAnswer": 0,
    "explanation": "The hierarchy supplies data when the first checked level lacks it."
  },
  {
    "topic": "CACHE",
    "question": "Does a larger cache guarantee a faster computer for every task?",
    "options": [
      "Yes, because clock speed becomes zero",
      "No, workload and other design factors matter",
      "Yes, regardless of all other components",
      "Only when the display is larger"
    ],
    "correctAnswer": 1,
    "explanation": "Performance depends on access patterns and the rest of the processor and system."
  },
  {
    "topic": "CACHE",
    "question": "What does memory bandwidth describe?",
    "options": [
      "Only the time for one access",
      "The number of installed games",
      "The rate of data transfer",
      "The number of monitor pixels"
    ],
    "correctAnswer": 2,
    "explanation": "Bandwidth concerns transfer rate; latency concerns the delay of an access."
  },
  {
    "topic": "CLOCK",
    "question": "What does the CPU clock provide?",
    "options": [
      "Permanent program storage",
      "Cooling air",
      "The next instruction address",
      "A timing signal for synchronized operations"
    ],
    "correctAnswer": 3,
    "explanation": "Clock signals coordinate the timing of processor activity."
  },
  {
    "topic": "CLOCK",
    "question": "What does hertz measure?",
    "options": [
      "Cycles per second",
      "Bytes per instruction",
      "Cores per motherboard",
      "Files per disk"
    ],
    "correctAnswer": 0,
    "explanation": "Hertz is a frequency unit equal to one cycle per second."
  },
  {
    "topic": "CLOCK",
    "question": "How many clock cycles per second is 2 GHz?",
    "options": [
      "Exactly two billion instructions",
      "Two billion",
      "Two million",
      "Two thousand"
    ],
    "correctAnswer": 1,
    "explanation": "Giga denotes a billion; clock cycles and instructions are different counts."
  },
  {
    "topic": "CLOCK",
    "question": "Does one clock cycle always complete one instruction?",
    "options": [
      "Only if RAM is empty",
      "Only if the monitor is off",
      "No, instructions and cycles do not have a fixed one-to-one relationship",
      "Yes, for every CPU and instruction"
    ],
    "correctAnswer": 2,
    "explanation": "Instructions may take several cycles and processors may overlap execution."
  },
  {
    "topic": "CLOCK",
    "question": "What does instruction pipelining do?",
    "options": [
      "Removes the need for registers",
      "Stores all data on disk",
      "Makes every instruction instantaneous",
      "Overlaps stages of different instructions"
    ],
    "correctAnswer": 3,
    "explanation": "Pipelining improves throughput by overlapping instruction processing stages."
  },
  {
    "topic": "CLOCK",
    "question": "What is CPU throughput?",
    "options": [
      "The rate of completed work",
      "The size of the computer case",
      "The number of fan blades",
      "The number of files installed"
    ],
    "correctAnswer": 0,
    "explanation": "Throughput measures how much work is completed per unit time."
  },
  {
    "topic": "CLOCK",
    "question": "What is a physical CPU core?",
    "options": [
      "A software file",
      "An execution unit capable of processing an instruction stream",
      "A clock tick",
      "A cache byte"
    ],
    "correctAnswer": 1,
    "explanation": "A core contains hardware that executes instructions."
  },
  {
    "topic": "CLOCK",
    "question": "What does hardware multithreading allow?",
    "options": [
      "All programs to run without memory",
      "All instructions to finish in zero cycles",
      "A core to support multiple hardware thread contexts",
      "A core to become two physical chips"
    ],
    "correctAnswer": 2,
    "explanation": "Hardware threads can share execution resources to improve utilization."
  },
  {
    "topic": "CLOCK",
    "question": "Does doubling clock rate always double application performance?",
    "options": [
      "Yes, for every application",
      "Only if storage is full",
      "Yes, because the ISA disappears",
      "No, memory delays and workload behavior also matter"
    ],
    "correctAnswer": 3,
    "explanation": "Clock frequency is only one contributor to execution time."
  },
  {
    "topic": "CLOCK",
    "question": "What is a processor turbo frequency?",
    "options": [
      "A higher frequency reached under suitable operating conditions",
      "A guarantee of that frequency at all times",
      "The capacity of RAM",
      "The number of processor sockets"
    ],
    "correctAnswer": 0,
    "explanation": "Boost behavior depends on factors such as power, temperature, and workload."
  },
  {
    "topic": "CLOCK",
    "question": "What does overclocking mean?",
    "options": [
      "Increasing the screen size",
      "Operating above specified baseline clock settings",
      "Adding more files to cache",
      "Replacing arithmetic with graphics"
    ],
    "correctAnswer": 1,
    "explanation": "Overclocking raises operating frequency and may affect heat, power, and stability."
  },
  {
    "topic": "CLOCK",
    "question": "What is a key purpose of efficiency cores?",
    "options": [
      "Providing permanent storage",
      "Replacing all I/O ports",
      "Handling work with an emphasis on energy efficiency",
      "Eliminating every performance core"
    ],
    "correctAnswer": 2,
    "explanation": "Efficiency-oriented cores prioritize useful work within a smaller energy budget."
  },
  {
    "topic": "CLOCK",
    "question": "A 1 GHz clock has roughly what cycle duration?",
    "options": [
      "One second",
      "One millisecond",
      "One minute",
      "One nanosecond"
    ],
    "correctAnswer": 3,
    "explanation": "One cycle divided by one billion cycles per second is one nanosecond."
  },
  {
    "topic": "CLOCK",
    "question": "A task takes 6 billion cycles at 3 GHz. Ignoring delays, how long is it?",
    "options": [
      "Two seconds",
      "Eighteen seconds",
      "Half a second",
      "Six milliseconds"
    ],
    "correctAnswer": 0,
    "explanation": "Time equals cycle count divided by cycles per second: 6 billion divided by 3 billion."
  },
  {
    "topic": "CLOCK",
    "question": "Why can a pipeline stall?",
    "options": [
      "Because an ISA cannot contain branches",
      "An instruction may need a result or resource that is not ready",
      "Because every pipeline stage stores permanent files",
      "Because a clock cycle must last a minute"
    ],
    "correctAnswer": 1,
    "explanation": "Dependencies and resource or control conflicts can interrupt smooth pipeline progress."
  }
];

// Boss-only challenges progress from concepts to multi-step calculations.
const cpuBossQuestions = [
  {
    "stage": 0,
    "difficulty": 1,
    "question": "A device must execute software instructions. Which component does it need?",
    "options": [
      "CPU",
      "SSD enclosure",
      "Power connector",
      "Display backlight"
    ],
    "correctAnswer": 0,
    "explanation": "The CPU executes software instructions."
  },
  {
    "stage": 0,
    "difficulty": 1,
    "question": "A designer separates instruction memory from data memory. Which model is this?",
    "options": [
      "A processor socket",
      "Harvard",
      "Von Neumann shared-memory model",
      "Browser caching"
    ],
    "correctAnswer": 1,
    "explanation": "Harvard architecture separates instruction and data storage."
  },
  {
    "stage": 0,
    "difficulty": 1,
    "question": "Instructions and data share one memory. Which model fits?",
    "options": [
      "A graphics-only pipeline",
      "An audio converter",
      "Von Neumann",
      "Harvard with separate memories"
    ],
    "correctAnswer": 2,
    "explanation": "The von Neumann model uses a shared memory for code and data."
  },
  {
    "stage": 0,
    "difficulty": 1,
    "question": "A sensor needs a chip with CPU, memory, and I/O. What is the best fit?",
    "options": [
      "Bare register",
      "Clock crystal alone",
      "An SSD",
      "Microcontroller"
    ],
    "correctAnswer": 3,
    "explanation": "Microcontrollers integrate the components needed for dedicated embedded tasks."
  },
  {
    "stage": 0,
    "difficulty": 1,
    "question": "Two processors use the same ISA. What does that primarily describe?",
    "options": [
      "Their machine-level software interface",
      "Identical clock speeds",
      "Identical power consumption",
      "Identical cache capacities"
    ],
    "correctAnswer": 0,
    "explanation": "The ISA specifies instructions and programmer-visible behavior, not identical performance."
  },
  {
    "stage": 0,
    "difficulty": 1,
    "question": "A program has independent tasks. What CPU feature can help run them in parallel?",
    "options": [
      "A brighter display",
      "Multiple cores",
      "A larger case",
      "A different keyboard"
    ],
    "correctAnswer": 1,
    "explanation": "Independent work can be distributed across processing cores."
  },
  {
    "stage": 0,
    "difficulty": 1,
    "question": "A CPU has four physical cores. Which description is correct?",
    "options": [
      "Four-byte",
      "Four-instruction maximum",
      "Quad-core",
      "Four-gigahertz necessarily"
    ],
    "correctAnswer": 2,
    "explanation": "Quad-core describes four physical execution cores, not frequency or instruction count."
  },
  {
    "stage": 0,
    "difficulty": 1,
    "question": "A CPU executes a memory-access instruction. What else must it cooperate with?",
    "options": [
      "Only the monitor",
      "Only the fan",
      "Only the power button",
      "The memory system"
    ],
    "correctAnswer": 3,
    "explanation": "The CPU uses the memory system to read or write program data."
  },
  {
    "stage": 1,
    "difficulty": 2,
    "question": "An instruction has arrived, but its operation is unknown. Which stage comes next?",
    "options": [
      "Write a result before execution",
      "Decode",
      "Fetch that same instruction forever",
      "Power off"
    ],
    "correctAnswer": 1,
    "explanation": "Decode identifies the instruction operation and operands."
  },
  {
    "stage": 1,
    "difficulty": 2,
    "question": "An ADD instruction needs two registers read and one result written. Who coordinates these actions?",
    "options": [
      "SSD casing",
      "Clock crystal alone",
      "Control Unit",
      "Monitor controller"
    ],
    "correctAnswer": 2,
    "explanation": "Control logic enables the required reads, ALU operation, and destination write."
  },
  {
    "stage": 1,
    "difficulty": 2,
    "question": "A taken branch redirects execution. Which action must control logic arrange?",
    "options": [
      "Erase the entire cache",
      "Change the CPU socket",
      "Stop every future clock pulse",
      "Update the next-instruction address"
    ],
    "correctAnswer": 3,
    "explanation": "A branch changes the program counter or equivalent next-fetch address."
  },
  {
    "stage": 1,
    "difficulty": 2,
    "question": "The decoder reads an opcode. What does it determine?",
    "options": [
      "Which operation is requested",
      "The processor case color",
      "The total SSD capacity",
      "The number of fans"
    ],
    "correctAnswer": 0,
    "explanation": "An opcode encodes the operation that control logic must select."
  },
  {
    "stage": 1,
    "difficulty": 2,
    "question": "A fetched instruction names R1 and R2. What are those names acting as?",
    "options": [
      "Power settings",
      "Operand locations",
      "Clock frequencies",
      "Cache capacities"
    ],
    "correctAnswer": 1,
    "explanation": "Operands can identify registers containing the values used by an instruction."
  },
  {
    "stage": 1,
    "difficulty": 2,
    "question": "The ALU has produced a result. Which stage saves it to the destination?",
    "options": [
      "Source-code compilation",
      "Instruction prediction",
      "Write-back",
      "Initial fetch"
    ],
    "correctAnswer": 2,
    "explanation": "Write-back places the execution result in its designated destination."
  },
  {
    "stage": 1,
    "difficulty": 2,
    "question": "An I/O device requests urgent CPU attention. What mechanism handles this request?",
    "options": [
      "Increasing font size",
      "Changing a socket",
      "Deleting every register",
      "Interrupt handling"
    ],
    "correctAnswer": 3,
    "explanation": "Interrupt handling temporarily redirects execution to service the event."
  },
  {
    "stage": 1,
    "difficulty": 2,
    "question": "A branch predictor guesses incorrectly. What must happen to instructions on the wrong path?",
    "options": [
      "They must be discarded before they change architectural state",
      "They must always be saved as program results",
      "They become permanent ISA instructions",
      "They erase all physical memory"
    ],
    "correctAnswer": 0,
    "explanation": "Incorrect speculative work must not commit results to the visible program state."
  },
  {
    "stage": 2,
    "difficulty": 3,
    "question": "R1 contains 12 and R2 contains 7. ADD R3,R1,R2 writes what to R3?",
    "options": [
      "12",
      "84",
      "19",
      "5"
    ],
    "correctAnswer": 2,
    "explanation": "The destination receives the sum of the two source-register values."
  },
  {
    "stage": 2,
    "difficulty": 3,
    "question": "The PC is 100 and instructions are 4 bytes. With no branch, what is the next sequential address?",
    "options": [
      "101",
      "400",
      "96",
      "104"
    ],
    "correctAnswer": 3,
    "explanation": "For this fixed instruction size, the sequential address advances by four bytes."
  },
  {
    "stage": 2,
    "difficulty": 3,
    "question": "A taken branch targets address 240 while the PC is 104. Where should fetching continue?",
    "options": [
      "240",
      "108",
      "104",
      "344"
    ],
    "correctAnswer": 0,
    "explanation": "A taken branch redirects the next-instruction address to the target."
  },
  {
    "stage": 2,
    "difficulty": 3,
    "question": "An address register holds 1000 and a load uses an offset of 12. What effective address is used?",
    "options": [
      "12",
      "1012",
      "988",
      "12000"
    ],
    "correctAnswer": 1,
    "explanation": "Base-plus-offset addressing adds the base address and displacement."
  },
  {
    "stage": 2,
    "difficulty": 3,
    "question": "R1 holds address 2000; memory at 2000 contains 9. What does a load from [R1] retrieve?",
    "options": [
      "2009",
      "The entire RAM",
      "9",
      "2000"
    ],
    "correctAnswer": 2,
    "explanation": "The register supplies an address; the load retrieves the value stored there."
  },
  {
    "stage": 2,
    "difficulty": 3,
    "question": "An unsigned 8-bit register can represent which range?",
    "options": [
      "0 through 256",
      "-128 through 255",
      "1 through 256",
      "0 through 255"
    ],
    "correctAnswer": 3,
    "explanation": "Eight bits provide 256 distinct unsigned values, starting at zero."
  },
  {
    "stage": 2,
    "difficulty": 3,
    "question": "A processor has 16 general-purpose registers. How many bits identify one register?",
    "options": [
      "4",
      "8",
      "16",
      "2"
    ],
    "correctAnswer": 0,
    "explanation": "Four bits encode 16 possibilities because 2 to the fourth power is 16."
  },
  {
    "stage": 2,
    "difficulty": 3,
    "question": "A store writes the value in R2 to the address in R1. Which register supplies the address?",
    "options": [
      "Neither register",
      "R1",
      "R2",
      "Both registers must hold identical values"
    ],
    "correctAnswer": 1,
    "explanation": "The specified store uses R1 as the address and R2 as the data source."
  },
  {
    "stage": 3,
    "difficulty": 4,
    "question": "For 8-bit operands, what is 11001010 AND 10101100?",
    "options": [
      "11101110",
      "01100110",
      "00000000",
      "10001000"
    ],
    "correctAnswer": 3,
    "explanation": "AND retains a one only where both corresponding input bits are one."
  },
  {
    "stage": 3,
    "difficulty": 4,
    "question": "What is 11001010 XOR 10101100?",
    "options": [
      "01100110",
      "10001000",
      "11101110",
      "11111111"
    ],
    "correctAnswer": 0,
    "explanation": "XOR sets each result bit when the input bits differ."
  },
  {
    "stage": 3,
    "difficulty": 4,
    "question": "What is 11001010 OR 10101100?",
    "options": [
      "00000001",
      "11101110",
      "10001000",
      "01100110"
    ],
    "correctAnswer": 1,
    "explanation": "OR sets a result bit when either corresponding input bit is one."
  },
  {
    "stage": 3,
    "difficulty": 4,
    "question": "An 8-bit unsigned add computes 255 + 1. What 8-bit result is stored?",
    "options": [
      "255, with no carry",
      "1, with no carry",
      "0, with carry out",
      "256, with no carry"
    ],
    "correctAnswer": 2,
    "explanation": "The ninth bit is a carry out; the low eight result bits are zero."
  },
  {
    "stage": 3,
    "difficulty": 4,
    "question": "In 8-bit signed two's complement, what happens when 127 + 1 is computed?",
    "options": [
      "The stored result is positive 128",
      "No overflow; the result stays 127",
      "The CPU must change its ISA",
      "Signed overflow; the stored bit pattern represents -128"
    ],
    "correctAnswer": 3,
    "explanation": "The mathematical result is outside the signed range -128 through 127."
  },
  {
    "stage": 3,
    "difficulty": 4,
    "question": "What is 00011000 shifted left logically by two bits in an 8-bit result?",
    "options": [
      "01100000",
      "00000110",
      "11000000",
      "00011010"
    ],
    "correctAnswer": 0,
    "explanation": "Each left shift moves the bits one position left and inserts a zero on the right."
  },
  {
    "stage": 3,
    "difficulty": 4,
    "question": "What decimal value does the 8-bit two's-complement pattern 11111111 represent?",
    "options": [
      "0",
      "-1",
      "255 as a signed value",
      "-128"
    ],
    "correctAnswer": 1,
    "explanation": "In two's complement, all-one bits represent negative one."
  },
  {
    "stage": 3,
    "difficulty": 4,
    "question": "For unsigned values, A is 0101 and B is 1001. What is the comparison A < B?",
    "options": [
      "They are equal",
      "The operands are not binary",
      "True: 5 is less than 9",
      "False: 5 is greater than 9"
    ],
    "correctAnswer": 2,
    "explanation": "The bit patterns represent unsigned five and nine."
  },
  {
    "stage": 4,
    "difficulty": 5,
    "question": "A cache has 1 ns hit time, 10% miss rate, and 50 ns additional miss penalty. What is average access time?",
    "options": [
      "6 ns",
      "51 ns",
      "5 ns",
      "60 ns"
    ],
    "correctAnswer": 0,
    "explanation": "Average time is hit time plus miss rate times additional penalty: 1 + 0.10 x 50 = 6 ns."
  },
  {
    "stage": 4,
    "difficulty": 5,
    "question": "Out of 1000 accesses, 920 hit in cache. What is the hit rate?",
    "options": [
      "0.92%",
      "92%",
      "8%",
      "9.2%"
    ],
    "correctAnswer": 1,
    "explanation": "Hit rate is 920 divided by 1000, or 92 percent."
  },
  {
    "stage": 4,
    "difficulty": 5,
    "question": "A 32 KiB cache stores 64-byte lines. Ignoring metadata, how many lines fit?",
    "options": [
      "2048",
      "64",
      "512",
      "32"
    ],
    "correctAnswer": 2,
    "explanation": "32 x 1024 bytes divided by 64 bytes per line equals 512 lines."
  },
  {
    "stage": 4,
    "difficulty": 5,
    "question": "Why can sequential array access benefit from caching?",
    "options": [
      "Every access must bypass cache",
      "Each element changes the ISA",
      "Sequential data is always a register",
      "Nearby values may arrive together in a cache line"
    ],
    "correctAnswer": 3,
    "explanation": "Spatial locality means nearby data is likely to be used soon."
  },
  {
    "stage": 4,
    "difficulty": 5,
    "question": "A loop repeatedly uses the same small set of values. Which locality does this illustrate?",
    "options": [
      "Temporal locality",
      "No reuse",
      "Disk persistence",
      "A clock-frequency change"
    ],
    "correctAnswer": 0,
    "explanation": "Temporal locality is the tendency to reuse recently accessed data."
  },
  {
    "stage": 4,
    "difficulty": 5,
    "question": "L1 misses, but L2 has the requested line. Is a RAM access necessarily required?",
    "options": [
      "The CPU must restart",
      "No, L2 can supply the line",
      "Yes, every L1 miss requires RAM",
      "Only the SSD can supply it"
    ],
    "correctAnswer": 1,
    "explanation": "A hit at a lower cache level can satisfy an upper-level miss."
  },
  {
    "stage": 4,
    "difficulty": 5,
    "question": "A cache hit costs 2 ns; 5% of accesses add a 100 ns miss penalty. What is average time?",
    "options": [
      "5 ns",
      "20 ns",
      "7 ns",
      "102 ns"
    ],
    "correctAnswer": 2,
    "explanation": "Average access time is 2 + 0.05 x 100 = 7 ns."
  },
  {
    "stage": 4,
    "difficulty": 5,
    "question": "Two cores share an L3 cache. Why is that useful?",
    "options": [
      "It makes their registers identical",
      "It guarantees no cache misses",
      "It forces both cores to run the same instruction",
      "It provides a shared cache capacity for their memory traffic"
    ],
    "correctAnswer": 3,
    "explanation": "A shared last-level cache can serve multiple cores and reduce trips to RAM."
  },
  {
    "stage": 5,
    "difficulty": 6,
    "question": "A task uses 3 billion instructions at CPI 2 on a 3 GHz CPU. What is CPU time?",
    "options": [
      "0.5 seconds",
      "2 seconds",
      "1 second",
      "6 seconds"
    ],
    "correctAnswer": 1,
    "explanation": "Time = instructions x cycles per instruction / frequency = 3 billion x 2 / 3 billion."
  },
  {
    "stage": 5,
    "difficulty": 6,
    "question": "CPU A is 2 GHz at CPI 1; CPU B is 3 GHz at CPI 2. For equal instruction counts, which finishes sooner?",
    "options": [
      "They always tie",
      "Clock rate alone proves B wins",
      "CPU A",
      "CPU B"
    ],
    "correctAnswer": 2,
    "explanation": "A uses 0.5 ns per instruction; B uses about 0.667 ns per instruction."
  },
  {
    "stage": 5,
    "difficulty": 6,
    "question": "Half the instructions have CPI 1 and half have CPI 3. What is average CPI?",
    "options": [
      "1.5",
      "3",
      "4",
      "2"
    ],
    "correctAnswer": 3,
    "explanation": "The weighted average is 0.5 x 1 + 0.5 x 3 = 2."
  },
  {
    "stage": 5,
    "difficulty": 6,
    "question": "A 4 GHz clock has approximately what period?",
    "options": [
      "0.25 ns",
      "4 ns",
      "0.25 ms",
      "4 seconds"
    ],
    "correctAnswer": 0,
    "explanation": "Period is the reciprocal of frequency: 1 / 4 billion seconds."
  },
  {
    "stage": 5,
    "difficulty": 6,
    "question": "Clock rate increases 20% with cycle count unchanged. What happens to execution time?",
    "options": [
      "It becomes zero",
      "It becomes about 83.3% of the original",
      "It becomes 120% of the original",
      "It becomes exactly 80% of the original"
    ],
    "correctAnswer": 1,
    "explanation": "Time is inversely proportional to frequency, so the new time is 1 / 1.2 of the old time."
  },
  {
    "stage": 5,
    "difficulty": 6,
    "question": "An ideal 5-stage pipeline runs 10 instructions at one cycle per stage. How many cycles are needed including fill?",
    "options": [
      "10",
      "5",
      "14",
      "50"
    ],
    "correctAnswer": 2,
    "explanation": "With no stalls, the total is stages + instructions - 1 = 5 + 10 - 1."
  },
  {
    "stage": 5,
    "difficulty": 6,
    "question": "A workload is 25% serial and 75% perfectly parallel. What is its ideal speedup on four cores?",
    "options": [
      "Exactly 4 times",
      "Exactly 3 times",
      "About 1.14 times",
      "About 2.29 times"
    ],
    "correctAnswer": 3,
    "explanation": "The new relative time is 0.25 + 0.75 / 4 = 0.4375; its reciprocal is about 2.29."
  },
  {
    "stage": 5,
    "difficulty": 6,
    "question": "A program needs 8 billion cycles. How long at 2 GHz, ignoring other delays?",
    "options": [
      "4 seconds",
      "16 seconds",
      "2 seconds",
      "0.25 seconds"
    ],
    "correctAnswer": 0,
    "explanation": "Execution time is cycle count divided by clock frequency: 8 billion / 2 billion = 4 seconds."
  }
];
