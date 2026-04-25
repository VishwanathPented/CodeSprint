import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TheoryQuestion from './models/TheoryQuestion.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codesprint50')
  .then(() => console.log('Connected to MongoDB for Theory Seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

const q = (section, topic, difficulty, question, options, correctIndex, explanation) =>
  ({ section, topic, difficulty, question, options, correctIndex, explanation });

const questions = [
  // ============ OS: PROCESSES & THREADS (8) ============
  q('os', 'Processes & Threads', 'Easy',
    'What is the main difference between a process and a thread?',
    [
      'Processes are faster than threads',
      'Threads share memory within the same process; processes have separate memory spaces',
      'Threads can only run on one CPU core',
      'Processes cannot communicate with each other'
    ], 1,
    'Threads within a process share the heap and code segments. Processes are fully isolated and must use IPC to communicate.'),
  q('os', 'Processes & Threads', 'Easy',
    'Which component is responsible for deciding which process runs next?',
    ['Compiler', 'Scheduler', 'Assembler', 'Linker'], 1,
    "The OS scheduler selects the next process/thread based on the scheduling algorithm."),
  q('os', 'Processes & Threads', 'Medium',
    'What is a context switch?',
    [
      'Moving a file between directories',
      'Saving the state of the current process and loading the state of another',
      'Changing the keyboard layout',
      'Restarting the OS'
    ], 1,
    'Context switches save CPU registers, PC, and stack pointers of the outgoing process and restore them for the incoming one. Too many context switches hurt performance.'),
  q('os', 'Processes & Threads', 'Medium',
    'Which of the following is NOT a state in the process lifecycle?',
    ['Ready', 'Running', 'Blocked', 'Compiled'], 3,
    'Standard process states: new, ready, running, waiting/blocked, terminated. "Compiled" is a build-time concept, not a runtime state.'),
  q('os', 'Processes & Threads', 'Medium',
    'A zombie process is one that:',
    [
      'Consumes 100% CPU',
      'Has terminated but whose entry still exists in the process table',
      'Runs in the background forever',
      'Is infected by malware'
    ], 1,
    'A zombie has completed execution but its parent has not yet read its exit status, so its PCB entry remains.'),
  q('os', 'Processes & Threads', 'Hard',
    'Which scheduling algorithm can cause starvation?',
    [
      'First Come First Serve (FCFS)',
      'Round Robin',
      'Priority scheduling',
      'Both FCFS and Round Robin'
    ], 2,
    'Priority scheduling can starve low-priority processes if high-priority ones keep arriving. Aging mitigates this by gradually raising waiting processes\' priority.'),
  q('os', 'Processes & Threads', 'Hard',
    'In multi-threading, what does the "thread-safe" property imply?',
    [
      'The thread cannot be killed',
      'Concurrent access by multiple threads will not produce incorrect results',
      'It uses less memory',
      'It runs faster'
    ], 1,
    'Thread-safe code uses locks, atomics, or immutable data so that correctness is preserved even under concurrent execution.'),
  q('os', 'Processes & Threads', 'Medium',
    'What is the benefit of user-level threads over kernel-level threads?',
    [
      'User-level threads are managed entirely by the OS kernel',
      'User-level threads are faster to create and context-switch but cannot exploit multiple CPUs without kernel support',
      'User-level threads can survive kernel crashes',
      'There is no difference'
    ], 1,
    'User threads live in user space, avoiding system calls for switches. But the kernel sees only the process, so a blocking syscall can block all threads of that process.'),

  // ============ OS: MEMORY MANAGEMENT (7) ============
  q('os', 'Memory Management', 'Easy',
    'What is virtual memory?',
    [
      'Memory that does not exist',
      'An abstraction that gives each process the illusion of a large, private, contiguous address space',
      'Only the RAM',
      'Cache memory'
    ], 1,
    'Virtual memory decouples process addresses from physical RAM, using paging/swap to extend effective memory beyond RAM.'),
  q('os', 'Memory Management', 'Medium',
    'A page fault occurs when:',
    [
      'A page has incorrect data',
      'A process accesses a page that is not currently in RAM',
      'The OS crashes',
      'Two processes access the same page'
    ], 1,
    'On a page fault, the OS loads the required page from disk into RAM, possibly evicting another page.'),
  q('os', 'Memory Management', 'Medium',
    'What is thrashing?',
    [
      'Excessive paging activity where the OS spends more time swapping than executing',
      'A crash caused by malware',
      'Running out of CPU registers',
      'Overclocking the CPU'
    ], 0,
    'Thrashing happens when working sets exceed RAM; the system becomes I/O-bound on page transfers.'),
  q('os', 'Memory Management', 'Medium',
    'Which page replacement algorithm is theoretically optimal but not implementable in practice?',
    ['FIFO', 'LRU', 'Optimal (Belady\'s)', 'Clock'], 2,
    'The optimal algorithm evicts the page that will not be used for the longest time in the future. This requires knowledge of future accesses, so it\'s only a theoretical baseline.'),
  q('os', 'Memory Management', 'Hard',
    'What is external fragmentation?',
    [
      'Free memory is split into many small non-contiguous blocks, none large enough for a request',
      'A single allocation has unused internal space',
      'A program uses more memory than allocated',
      'Memory is corrupted'
    ], 0,
    'External fragmentation is a problem of contiguous allocation. Paging eliminates it because pages can be non-contiguous in physical memory.'),
  q('os', 'Memory Management', 'Hard',
    'In a two-level page table scheme on a 32-bit system with 4 KB pages and 4-byte page table entries, how large is each inner page table?',
    ['4 KB', '8 KB', '16 KB', '1 MB'], 0,
    '4 KB pages → 12 offset bits. Remaining 20 bits split 10/10 typically; 1024 entries × 4 B = 4 KB per inner table, fitting exactly in one page.'),
  q('os', 'Memory Management', 'Medium',
    'Which of these is a valid allocation strategy for contiguous memory allocation?',
    ['First Fit', 'Best Fit', 'Worst Fit', 'All of the above'], 3,
    'First Fit, Best Fit, and Worst Fit are all valid strategies with different trade-offs in fragmentation and allocation speed.'),

  // ============ OS: SYNCHRONIZATION & DEADLOCK (7) ============
  q('os', 'Synchronization & Deadlock', 'Easy',
    'A race condition occurs when:',
    [
      'Two processes finish at the same time',
      'The outcome depends on the unpredictable order of execution of multiple threads',
      'A process is waiting forever',
      'The CPU overheats'
    ], 1,
    'Race conditions arise when threads access shared state without proper synchronization, and the result depends on interleaving.'),
  q('os', 'Synchronization & Deadlock', 'Medium',
    'Which of these is NOT a Coffman condition for deadlock?',
    ['Mutual Exclusion', 'Hold and Wait', 'Preemption', 'Circular Wait'], 2,
    'The four Coffman conditions are: Mutual Exclusion, Hold and Wait, NO Preemption, and Circular Wait. Preemption ACTUALLY PREVENTS deadlock.'),
  q('os', 'Synchronization & Deadlock', 'Medium',
    'What does a binary semaphore behave like?',
    ['A counting semaphore with max value 1, i.e., a mutex', 'An integer counter', 'A signal handler', 'A timer'], 0,
    'Binary semaphore = mutex. Values restricted to 0 or 1.'),
  q('os', 'Synchronization & Deadlock', 'Medium',
    'In the producer-consumer problem, what prevents the consumer from reading from an empty buffer?',
    [
      'A counting semaphore tracking filled slots',
      'A boolean flag',
      'The CPU scheduler',
      'Polling in a tight loop'
    ], 0,
    'Two counting semaphores (empty and full) synchronize producer and consumer. Consumer waits on "full" before reading.'),
  q('os', 'Synchronization & Deadlock', 'Hard',
    'The Banker\'s algorithm is used for:',
    ['Deadlock prevention', 'Deadlock detection', 'Deadlock avoidance', 'Deadlock recovery'], 2,
    'Banker\'s algorithm grants a resource only if the resulting state is "safe" — a sequence exists where all processes can complete. This is avoidance, not prevention.'),
  q('os', 'Synchronization & Deadlock', 'Hard',
    'Priority inversion can be solved by:',
    [
      'Disabling all interrupts',
      'Priority inheritance protocol',
      'Round-robin scheduling',
      'Increasing CPU speed'
    ], 1,
    'Priority inheritance temporarily boosts a low-priority lock holder to the highest priority waiting on it, so it can release the lock promptly.'),
  q('os', 'Synchronization & Deadlock', 'Medium',
    'What is a critical section?',
    [
      'Code that must run with root privileges',
      'A section of code that accesses shared resources and must not be executed concurrently',
      'The startup code of a process',
      'Code in the kernel'
    ], 1,
    'Critical sections protect shared state. Only one thread at a time should execute the critical section for a given resource.'),

  // ============ OS: FILE SYSTEMS (4) ============
  q('os', 'File Systems', 'Medium',
    'An inode in Unix contains:',
    [
      'The file name',
      'File metadata (permissions, owner, size, block pointers) but NOT the name',
      'Only the file content',
      'The parent directory pointer'
    ], 1,
    'The inode holds metadata + data block pointers. The filename lives in the directory entry which maps name → inode number.'),
  q('os', 'File Systems', 'Medium',
    'Which allocation method suffers from external fragmentation?',
    ['Contiguous allocation', 'Linked allocation', 'Indexed allocation', 'None of these'], 0,
    'Contiguous allocation needs a large enough free gap; over time gaps get fragmented.'),
  q('os', 'File Systems', 'Hard',
    'What is journaling in a file system?',
    [
      'A log of user commands',
      'A technique where metadata changes are written to a log first, ensuring consistency after crashes',
      'Encrypting files',
      'Compressing files'
    ], 1,
    'Journaling (ext3/ext4/NTFS) writes intended changes to a log before applying them, so a crash leaves the FS recoverable.'),
  q('os', 'File Systems', 'Easy',
    'What does "ls -l" in Unix show?',
    ['Only file names', 'Detailed listing: permissions, owner, size, date, name', 'Process list', 'Logged-in users'], 1,
    'The -l flag gives the long listing format with full metadata.'),

  // ============ OS: GENERAL (4) ============
  q('os', 'General', 'Easy',
    'Which of these is a monolithic kernel?',
    ['Linux', 'Minix', 'QNX', 'Windows NT'], 0,
    'Linux kernel is monolithic. Minix and QNX are microkernels. Windows NT is a hybrid kernel.'),
  q('os', 'General', 'Easy',
    'A system call is:',
    [
      'A function in a user library',
      'A programmatic way to request a service from the OS kernel',
      'A network call',
      'A function that calls itself'
    ], 1,
    'System calls cross the user/kernel boundary via a controlled interface (e.g., syscall/int 0x80 on older x86).'),
  q('os', 'General', 'Medium',
    'The purpose of DMA (Direct Memory Access) is to:',
    [
      'Allow devices to transfer data to/from RAM without constant CPU involvement',
      'Encrypt memory',
      'Give kernel direct access to hard disk',
      'Reduce memory usage'
    ], 0,
    'DMA frees the CPU from copying data byte-by-byte between I/O and RAM. The CPU only needs to set up the transfer and handle the completion interrupt.'),
  q('os', 'General', 'Medium',
    'What is the kernel?',
    [
      'The main application of the OS',
      'The core part of the OS that manages hardware, memory, and processes',
      'A driver',
      'The user interface'
    ], 1,
    'The kernel is the innermost layer with full hardware privileges. User programs access resources only through its interfaces.'),

  // ============ NETWORKS: OSI & TCP/IP MODEL (6) ============
  q('networks', 'OSI & TCP/IP Model', 'Easy',
    'How many layers does the OSI model have?',
    ['5', '6', '7', '8'], 2,
    '7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.'),
  q('networks', 'OSI & TCP/IP Model', 'Easy',
    'Which layer is responsible for routing packets across networks?',
    ['Data Link', 'Network', 'Transport', 'Application'], 1,
    'The Network layer (IP) handles logical addressing and routing.'),
  q('networks', 'OSI & TCP/IP Model', 'Medium',
    'Which OSI layer does a router operate at?',
    ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'], 2,
    'Routers forward packets based on IP addresses = Network layer (Layer 3). Switches operate at Layer 2.'),
  q('networks', 'OSI & TCP/IP Model', 'Medium',
    'Which of the following is a Layer 2 protocol?',
    ['TCP', 'IP', 'Ethernet', 'HTTP'], 2,
    'Ethernet is a Data Link (Layer 2) protocol. TCP is L4, IP is L3, HTTP is L7.'),
  q('networks', 'OSI & TCP/IP Model', 'Medium',
    'The TCP/IP model combines which OSI layers into its Application layer?',
    [
      'Application only',
      'Application, Presentation, Session',
      'Transport and Application',
      'Physical and Data Link'
    ], 1,
    'TCP/IP merges OSI\'s top three layers (Session, Presentation, Application) into one Application layer.'),
  q('networks', 'OSI & TCP/IP Model', 'Hard',
    'Which OSI layer is responsible for reliable, end-to-end delivery?',
    ['Network', 'Transport', 'Session', 'Presentation'], 1,
    'TCP at the Transport layer provides reliable delivery via retransmission, ordering, and flow control.'),

  // ============ NETWORKS: TCP & UDP (6) ============
  q('networks', 'TCP & UDP', 'Easy',
    'Which of the following is connection-oriented?',
    ['UDP', 'TCP', 'ICMP', 'IP'], 1,
    'TCP establishes a connection via the 3-way handshake before data transfer. UDP is connectionless.'),
  q('networks', 'TCP & UDP', 'Easy',
    'The TCP 3-way handshake consists of:',
    ['SYN, ACK, FIN', 'SYN, SYN-ACK, ACK', 'ACK, SYN, RST', 'PUSH, ACK, SYN'], 1,
    'Client sends SYN; server replies SYN-ACK; client acknowledges with ACK.'),
  q('networks', 'TCP & UDP', 'Medium',
    'Why might UDP be preferred for real-time video streaming?',
    [
      'UDP is more reliable than TCP',
      'UDP has lower latency because it does not retransmit lost packets',
      'UDP uses less memory',
      'UDP supports only small payloads'
    ], 1,
    'For real-time media, late data is useless — better to drop packets than wait for retransmission. UDP is preferred.'),
  q('networks', 'TCP & UDP', 'Medium',
    'What is the purpose of TCP\'s sliding window?',
    [
      'Encryption',
      'Flow control — the receiver advertises how much data it can accept',
      'Routing',
      'Load balancing'
    ], 1,
    'The receiver\'s advertised window tells the sender the maximum unacknowledged data in flight, preventing overflow.'),
  q('networks', 'TCP & UDP', 'Hard',
    'TCP congestion control uses which algorithm to detect network congestion?',
    [
      'Slow Start with Congestion Avoidance (AIMD)',
      'Round-robin',
      'Priority Queuing',
      'Dijkstra\'s algorithm'
    ], 0,
    'TCP uses additive increase / multiplicative decrease (AIMD) with slow start. On loss it multiplicatively drops the window.'),
  q('networks', 'TCP & UDP', 'Hard',
    'The TCP 4-way handshake is used for:',
    ['Connection establishment', 'Connection termination', 'Authentication', 'Encryption'], 1,
    'Connection close uses FIN from each side (4 segments: FIN, ACK, FIN, ACK) because connections are full-duplex.'),

  // ============ NETWORKS: IP & DNS (7) ============
  q('networks', 'IP & DNS', 'Easy',
    'An IPv4 address is:',
    ['32 bits', '64 bits', '128 bits', '16 bits'], 0,
    'IPv4 = 32 bits (4 octets of 8 bits). IPv6 = 128 bits.'),
  q('networks', 'IP & DNS', 'Easy',
    'What does DNS do?',
    [
      'Encrypts traffic',
      'Maps domain names to IP addresses',
      'Routes packets',
      'Detects intrusions'
    ], 1,
    'DNS is a distributed system that resolves human-friendly names like google.com to IP addresses.'),
  q('networks', 'IP & DNS', 'Medium',
    'Which of these is a private IP range (RFC 1918)?',
    ['8.8.8.0/24', '192.168.0.0/16', '172.217.0.0/16', '1.1.1.0/24'], 1,
    'Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Others are public.'),
  q('networks', 'IP & DNS', 'Medium',
    'What is NAT?',
    [
      'Network Address Translation — translates private IPs to a public IP at the router',
      'Network Acknowledgment Transfer',
      'Name Address Table',
      'Node Access Token'
    ], 0,
    'NAT lets many hosts with private IPs share one public IP. Standard in home routers.'),
  q('networks', 'IP & DNS', 'Medium',
    'Which port is the default for HTTPS?',
    ['21', '80', '443', '3306'], 2,
    'HTTPS = 443. HTTP = 80. FTP = 21. MySQL = 3306.'),
  q('networks', 'IP & DNS', 'Hard',
    'In DNS, which record type maps a name to an IPv4 address?',
    ['CNAME', 'A', 'MX', 'TXT'], 1,
    'A record → IPv4. AAAA → IPv6. CNAME → alias. MX → mail server.'),
  q('networks', 'IP & DNS', 'Hard',
    'Subnet mask 255.255.255.0 corresponds to which CIDR?',
    ['/16', '/20', '/24', '/28'], 2,
    '255.255.255.0 = 24 network bits → /24. Hosts: 2^8 − 2 = 254 usable.'),

  // ============ NETWORKS: HTTP & WEB (6) ============
  q('networks', 'HTTP & Web', 'Easy',
    'Which HTTP method is idempotent?',
    ['POST', 'PATCH', 'PUT', 'CONNECT'], 2,
    'PUT is idempotent (same request repeated gives same effect). GET, HEAD, DELETE, PUT, OPTIONS are idempotent; POST and PATCH are not.'),
  q('networks', 'HTTP & Web', 'Easy',
    'HTTP status 404 means:',
    ['Server error', 'Not Found', 'Unauthorized', 'Redirect'], 1,
    '404 = resource not found. 500 = server error. 401 = unauthorized. 301/302 = redirects.'),
  q('networks', 'HTTP & Web', 'Medium',
    'Which of the following is stateless?',
    ['SSH', 'FTP', 'HTTP', 'MQTT'], 2,
    'HTTP is stateless — each request is independent. Sessions are built on top via cookies or tokens.'),
  q('networks', 'HTTP & Web', 'Medium',
    'What does TLS provide?',
    [
      'Only encryption',
      'Confidentiality, integrity, and authentication between two parties',
      'Load balancing',
      'DNS resolution'
    ], 1,
    'TLS handshakes negotiate cipher suites, verify certificates (authentication), and establish a shared key for encryption and MAC (integrity).'),
  q('networks', 'HTTP & Web', 'Hard',
    'HTTP/2 improves over HTTP/1.1 by:',
    [
      'Switching to UDP',
      'Allowing multiplexed streams over one connection',
      'Removing status codes',
      'Using plain text'
    ], 1,
    'HTTP/2 uses a binary framing layer with multiplexed streams — one connection carries many concurrent requests.'),
  q('networks', 'HTTP & Web', 'Hard',
    'What is CORS?',
    [
      'Cross-Origin Resource Sharing — browser-enforced policy allowing cross-origin requests with explicit server opt-in',
      'Centralized Object Routing Service',
      'Customer Online Response System',
      'Certificate Origin Registration Server'
    ], 0,
    'CORS is enforced by browsers. Servers signal allowed origins via Access-Control-Allow-Origin headers.'),

  // ============ OOP: FUNDAMENTALS (6) ============
  q('oop', 'Fundamentals', 'Easy',
    'The four pillars of OOP are:',
    [
      'Encapsulation, Inheritance, Polymorphism, Abstraction',
      'Compilation, Execution, Linking, Loading',
      'Arrays, Lists, Maps, Sets',
      'Public, Private, Protected, Default'
    ], 0,
    'Classic OOP pillars: Encapsulation, Inheritance, Polymorphism, Abstraction.'),
  q('oop', 'Fundamentals', 'Easy',
    'Encapsulation refers to:',
    [
      'Hiding implementation details and exposing a clean interface',
      'Creating multiple classes',
      'Overloading methods',
      'Using static variables'
    ], 0,
    'Encapsulation bundles data and methods, restricts direct access, and exposes behavior via a well-defined interface.'),
  q('oop', 'Fundamentals', 'Medium',
    'Which keyword in Java denotes a class that cannot be instantiated?',
    ['final', 'abstract', 'static', 'sealed'], 1,
    'An abstract class may have unimplemented methods and cannot be directly instantiated.'),
  q('oop', 'Fundamentals', 'Medium',
    'In Java, what is the difference between == and .equals() for String?',
    [
      'No difference',
      '== compares references; .equals() compares content',
      '.equals() is faster',
      '== works only on numbers'
    ], 1,
    '== tests reference identity. .equals() (overridden in String) tests character-by-character equality.'),
  q('oop', 'Fundamentals', 'Hard',
    'Which principle states "subtypes must be substitutable for their base types"?',
    [
      'Single Responsibility Principle',
      'Open/Closed Principle',
      'Liskov Substitution Principle',
      'Interface Segregation Principle'
    ], 2,
    'LSP — if S is a subtype of T, objects of T may be replaced with S without breaking correctness.'),
  q('oop', 'Fundamentals', 'Hard',
    '"Favor composition over inheritance" means:',
    [
      'Never use inheritance',
      'Prefer building complex behavior by combining simple objects rather than extending classes',
      'Composition is faster',
      'Inheritance is deprecated'
    ], 1,
    'Composition is more flexible than deep inheritance hierarchies, which can become fragile and tightly coupled.'),

  // ============ OOP: INHERITANCE & POLYMORPHISM (6) ============
  q('oop', 'Inheritance & Polymorphism', 'Easy',
    'Polymorphism in OOP means:',
    [
      'A single interface that can refer to different underlying types / behaviors',
      'Having many classes',
      'Multiple inheritance',
      'Using generics'
    ], 0,
    'Polymorphism: one symbol, many behaviors. Achieved via inheritance (override) and overloading in many languages.'),
  q('oop', 'Inheritance & Polymorphism', 'Easy',
    'Does Java support multiple inheritance of classes?',
    [
      'Yes, directly',
      'No, but it supports multiple inheritance of interfaces',
      'Yes, using the "multi" keyword',
      'Only in Java 17+'
    ], 1,
    'Java disallows multiple class inheritance (to avoid the diamond problem) but allows a class to implement multiple interfaces.'),
  q('oop', 'Inheritance & Polymorphism', 'Medium',
    'Method overriding is:',
    [
      'Defining methods with the same name but different parameters',
      'Redefining a superclass method in a subclass with the same signature',
      'Static binding at compile time',
      'Overwriting private methods'
    ], 1,
    'Overriding is dynamic dispatch — the actual method called is decided at runtime based on the object\'s type.'),
  q('oop', 'Inheritance & Polymorphism', 'Medium',
    'Method overloading is resolved:',
    ['At runtime', 'At compile time', 'Never', 'Only in child classes'], 1,
    'Overloading is static polymorphism — the compiler picks the right overload based on argument types.'),
  q('oop', 'Inheritance & Polymorphism', 'Hard',
    'In Java, can a final method be overridden?',
    ['Yes', 'No', 'Only by abstract classes', 'Only in the same package'], 1,
    'final methods cannot be overridden. final classes cannot be extended.'),
  q('oop', 'Inheritance & Polymorphism', 'Hard',
    'What is the "diamond problem" in multiple inheritance?',
    [
      'Memory corruption',
      'Ambiguity when a class inherits the same method from two paths',
      'Stack overflow',
      'Infinite recursion'
    ], 1,
    'If class D extends B and C which both extend A, and all redefine a method, D inherits ambiguously. Java avoids this by disallowing multiple class inheritance.'),

  // ============ OOP: ABSTRACTION & INTERFACES (5) ============
  q('oop', 'Abstraction & Interfaces', 'Easy',
    'Which of the following best defines an interface in Java?',
    [
      'A class that has only private methods',
      'A contract specifying method signatures that implementing classes must provide',
      'A class with only static fields',
      'A reserved keyword with no use'
    ], 1,
    'Interfaces are contracts. Since Java 8 they can also have default and static methods.'),
  q('oop', 'Abstraction & Interfaces', 'Medium',
    'Which is the correct difference between abstract class and interface?',
    [
      'No difference',
      'An abstract class can have constructors and state; an interface traditionally only declares behavior',
      'Interfaces support inheritance; abstract classes do not',
      'Abstract classes can only have static methods'
    ], 1,
    'Abstract classes may hold state and constructors. Interfaces describe behavior; since Java 8 they can have default methods but no mutable state.'),
  q('oop', 'Abstraction & Interfaces', 'Medium',
    'When should you prefer an interface over an abstract class?',
    [
      'When you need shared state across subclasses',
      'When you want to define a capability that many unrelated classes can implement',
      'Always',
      'Never'
    ], 1,
    'Interfaces are ideal for cross-cutting capabilities (e.g., Comparable, Runnable). Abstract classes fit when subclasses share state and partial implementation.'),
  q('oop', 'Abstraction & Interfaces', 'Hard',
    'A marker interface (like Serializable in Java) is:',
    [
      'An interface with default methods only',
      'An empty interface used to tag classes for special runtime handling',
      'An interface that can be instantiated',
      'Deprecated in modern Java'
    ], 1,
    'Serializable and Cloneable are marker interfaces — no methods. The JVM/libraries check isinstance at runtime.'),
  q('oop', 'Abstraction & Interfaces', 'Medium',
    'Abstraction primarily helps with:',
    [
      'Memory efficiency',
      'Hiding complexity — the user sees WHAT, not HOW',
      'Faster execution',
      'Network performance'
    ], 1,
    'Abstraction models the essential behavior and hides implementation, letting callers rely on stable interfaces.')
];

const seedDB = async () => {
  try {
    await TheoryQuestion.deleteMany({});
    console.log('Cleared existing theory questions.');
    await TheoryQuestion.insertMany(questions);
    console.log(`Seeded ${questions.length} theory questions.`);
    process.exit();
  } catch (err) {
    console.error('Theory seeding error:', err);
    process.exit(1);
  }
};

setTimeout(seedDB, 1500);
