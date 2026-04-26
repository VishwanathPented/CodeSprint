import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DayContent from './models/DayContent.js';
import User from './models/User.js';
import Comment from './models/Comment.js';
import MockTest from './models/MockTest.js';
import TestResult from './models/TestResult.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codesprint50')
  .then(() => console.log('Connected to MongoDB for Seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

const days = [];

// Extracted from Java Roadmap PDF
const realJavaRoadmap = [
  {
    topicTitle: "Java Basics & Setup",
    desc: "History of Java, Java Features, JVM, JRE, JDK Architecture. Difference between C/C++ and Java.",
    detailedExplanation: "Java is an object-oriented programming language created by Sun Microsystems. To run Java on your computer, you need the JDK (Java Development Kit) which contains the compiler (javac) to turn your code into bytecode. Then, the JRE (Java Runtime Environment) uses the JVM (Java Virtual Machine) to run that bytecode.\n\nThis architecture is why Java is 'Platform Independent'. You write the code once, compile it into bytecode, and any computer with a JVM can run it!",
    commonConfusions: "Many beginners confuse the JDK, JRE, and JVM.\n- JDK: The complete toolbox you download to WRITE code.\n- JRE: The environment needed strictly to RUN code.\n- JVM: The imaginary machine inside the JRE that actually executes your bytecode.",
    mcqs: [
      { q: "What is JVM in Java?", options: [{t: "Java Virtual Machine", c: true}, {t: "Java Variable Manager", c: false}, {t: "Java Visual Mode", c: false}, {t: "Java Version Manager", c: false}] },
      { q: "Which tool is used to compile Java code?", options: [{t: "java", c: false}, {t: "javac", c: true}, {t: "javap", c: false}, {t: "javadoc", c: false}] },
      { q: "Java is best described as:", options: [{t: "Platform-dependent", c: false}, {t: "Hardware-specific", c: false}, {t: "OS-specific", c: false}, {t: "Platform-independent (WORA)", c: true}] },
      { q: "What does WORA stand for in the Java context?", options: [{t: "Write Once, Run Anywhere", c: true}, {t: "Write Object, Run Application", c: false}, {t: "Web Oriented Runtime Architecture", c: false}, {t: "Wait, Open, Run, Attach", c: false}] },
      { q: "What file extension does the Java compiler produce?", options: [{t: ".java", c: false}, {t: ".exe", c: false}, {t: ".class", c: true}, {t: ".jar", c: false}] },
      { q: "JDK contains which of the following?", options: [{t: "JRE + development tools (compiler, debugger)", c: true}, {t: "Just the JVM", c: false}, {t: "Only the standard library", c: false}, {t: "An IDE", c: false}] },
      { q: "Which command executes a compiled .class file?", options: [{t: "javac Main", c: false}, {t: "java Main", c: true}, {t: "run Main", c: false}, {t: "execute Main.class", c: false}] },
      { q: "Bytecode produced by `javac` is executed by:", options: [{t: "The operating system directly", c: false}, {t: "The CPU directly", c: false}, {t: "The JVM", c: true}, {t: "The Java Compiler", c: false}] },
      { q: "Which company originally developed Java?", options: [{t: "Microsoft", c: false}, {t: "Sun Microsystems", c: true}, {t: "IBM", c: false}, {t: "Oracle (originally)", c: false}] },
      { q: "Java is statically typed. What does that mean?", options: [{t: "Variables can hold any type", c: false}, {t: "Each variable's type is checked at compile time", c: true}, {t: "All variables must be static", c: false}, {t: "Types are inferred at runtime only", c: false}] },
      { q: "Which entry point does a standalone Java program need?", options: [{t: "public static void main(String[] args)", c: true}, {t: "public void start()", c: false}, {t: "static int run()", c: false}, {t: "main() at the top of the file", c: false}] },
      { q: "Which of these is NOT bundled inside the JRE?", options: [{t: "JVM", c: false}, {t: "Java standard libraries", c: false}, {t: "Java Compiler (javac)", c: true}, {t: "Class loader", c: false}] }
    ],
    code: {
      title: "First Java Program",
      desc: "Write a Java program to print 'Hello World!'.",
      starter: "public class Main {\n  public static void main(String[] args) {\n    // Print Hello World! below\n    \n  }\n}",
      expected: "Hello World!\n"
    },
    predict: [
      {
        codeSnippet: "public class Test {\n  public static void main(String[] args) {\n    System.out.println(\"Java is fun!\");\n  }\n}",
        expectedOutput: "Java is fun!",
        explanation: "The println method simply prints the exact string passed inside the quotes."
      }
    ],
    refactor: {
      title: "Clean Up the Greetings",
      description: "This code prints a greeting, but the variable names are terrible and there's unnecessary repetition. Refactor it to use clear variable names and follow DRY principles.",
      messyCode: "public class Main {\n  public static void main(String[] args) {\n    String a1 = \"Hello\";\n    String b2 = \"World\";\n    System.out.println(a1 + \" \" + b2);\n    System.out.println(a1 + \" \" + b2);\n  }\n}"
    }
  },
  {
    topicTitle: "Data Types & Variables",
    desc: "Basic syntax, Variables, Data types, Type casting, and Type Conversion.",
    detailedExplanation: "Variables are like containers for storing data values. In Java, every variable must have a 'Type' declared before you can use it (this is called static typing).\n\nPrimitive types include:\n- int: Whole numbers (e.g., 5)\n- double: Decimal numbers (e.g., 5.99)\n- char: Single characters (e.g., 'A')\n- boolean: True or False\n\nSometimes you need to fit a large number into a smaller container; this is called 'Type Casting'.",
    commonConfusions: "1. Mixing up String and char. `char` uses single quotes ('a') and stores exactly ONE character. `String` uses double quotes (\"hello\") and stores text.\n2. Forgetting that dividing two integers (like 5 / 2) drops the decimal and results in 2, not 2.5! You must use a double to keep the decimal.",
    mcqs: [
      { q: "What is the size of `int` in Java?", options: [{t: "2 bytes", c: false}, {t: "4 bytes", c: true}, {t: "8 bytes", c: false}, {t: "Depends on OS", c: false}] },
      { q: "Which of these is NOT a primitive type?", options: [{t: "boolean", c: false}, {t: "float", c: false}, {t: "String", c: true}, {t: "char", c: false}] },
      { q: "Which type of casting is performed automatically by the compiler?", options: [{t: "Narrowing", c: false}, {t: "Widening (implicit)", c: true}, {t: "Explicit", c: false}, {t: "None — Java forbids it", c: false}] },
      { q: "What is the size of a `byte` in Java?", options: [{t: "1 bit", c: false}, {t: "1 byte (8 bits)", c: true}, {t: "2 bytes", c: false}, {t: "Platform-dependent", c: false}] },
      { q: "Default value of an uninitialized `boolean` instance field?", options: [{t: "true", c: false}, {t: "false", c: true}, {t: "null", c: false}, {t: "Compile error if not initialized", c: false}] },
      { q: "What is the size of a `char` in Java?", options: [{t: "1 byte (ASCII)", c: false}, {t: "2 bytes (UTF-16)", c: true}, {t: "4 bytes", c: false}, {t: "Variable", c: false}] },
      { q: "Which is the largest integer primitive type?", options: [{t: "int", c: false}, {t: "long", c: true}, {t: "short", c: false}, {t: "BigInteger", c: false}] },
      { q: "What does `(int) 2.7` evaluate to?", options: [{t: "3 (rounded)", c: false}, {t: "2 (truncated)", c: true}, {t: "2.0", c: false}, {t: "Compile error", c: false}] },
      { q: "Default value of an `int` instance field?", options: [{t: "null", c: false}, {t: "0", c: true}, {t: "undefined", c: false}, {t: "-1", c: false}] },
      { q: "What does `final int x = 10;` mean?", options: [{t: "x can never be reassigned", c: true}, {t: "x is private", c: false}, {t: "x is static", c: false}, {t: "x must be class-level", c: false}] },
      { q: "Which is required for narrowing conversion (e.g. double → int)?", options: [{t: "Implicit — happens automatically", c: false}, {t: "An explicit cast like `(int) value`", c: true}, {t: "Use of the `cast` keyword", c: false}, {t: "Recompilation", c: false}] },
      { q: "What is the result of `int x = 5 / 2;`?", options: [{t: "2.5", c: false}, {t: "2", c: true}, {t: "3", c: false}, {t: "Compile error", c: false}] }
    ],
    code: {
      title: "Variable Assignment",
      desc: "Create an int variable 'x' assigned to 10 and print it.",
      starter: "public class Main {\n  public static void main(String[] args) {\n    \n  }\n}",
      expected: "10\n"
    },
    predict: [
      {
        codeSnippet: "public class Test {\n  public static void main(String[] args) {\n    int a = 5;\n    int b = 2;\n    System.out.println(a / b);\n  }\n}",
        expectedOutput: "2",
        explanation: "Integer division truncates the decimal part. 5 / 2 is mathematically 2.5, but in Java integers, it evaluates to exactly 2."
      }
    ]
  },
  {
    topicTitle: "Operators & Expressions",
    desc: "Arithmetic, Relational, Logical, and Bitwise Operators.",
    detailedExplanation: "Operators are special symbols that perform specific operations on one, two, or three variables, and then return a result.\n\n- Arithmetic (+, -, *, /, %) perform basic math.\n- Relational (==, !=, >, <) compare two values and return a boolean (true/false).\n- Logical (&&, ||, !) connect multiple boolean expressions together.\n\nThe modulo % operator is especially useful for finding if a number is even or odd by checking if `num % 2 == 0`.",
    commonConfusions: "The single equals `=` is the ASSIGNMENT operator. It assigns the value on the right to the variable on the left.\n\nThe double equals `==` is the COMPARISON operator. It checks if the left side is mathematically equal to the right side.\n\nNever do `if (a = b)`. Always do `if (a == b)`.",
    mcqs: [
      { q: "Which operator computes the remainder of integer division?", options: [{t: "/", c: false}, {t: "*", c: false}, {t: "%", c: true}, {t: "-", c: false}] },
      { q: "What is the output of `5 & 3` (bitwise AND)?", options: [{t: "8", c: false}, {t: "1", c: true}, {t: "2", c: false}, {t: "7", c: false}] },
      { q: "Which is the equality (comparison) operator in Java?", options: [{t: "=", c: false}, {t: "==", c: true}, {t: "===", c: false}, {t: "eq", c: false}] },
      { q: "What is the difference between `++a` and `a++`?", options: [{t: "Pre-increment vs post-increment — order of evaluation differs", c: true}, {t: "There is no difference", c: false}, {t: "`++a` is invalid in Java", c: false}, {t: "`a++` is faster", c: false}] },
      { q: "What is `5 | 3` (bitwise OR)?", options: [{t: "1", c: false}, {t: "7", c: true}, {t: "8", c: false}, {t: "15", c: false}] },
      { q: "Which logical operator short-circuits its evaluation?", options: [{t: "& (single)", c: false}, {t: "&& (double)", c: true}, {t: "% ", c: false}, {t: "Both & and &&", c: false}] },
      { q: "What is `5 ^ 3` (bitwise XOR)?", options: [{t: "6", c: true}, {t: "8", c: false}, {t: "2", c: false}, {t: "1", c: false}] },
      { q: "What does the unsigned right shift `>>>` do that `>>` does not?", options: [{t: "Always fills with 0 (ignores sign bit)", c: true}, {t: "Multiplies by 2", c: false}, {t: "Same as `>>`", c: false}, {t: "Throws on negative numbers", c: false}] },
      { q: "What is the ternary expression syntax in Java?", options: [{t: "if x then a else b", c: false}, {t: "x ? a : b", c: true}, {t: "x => a : b", c: false}, {t: "a if x else b", c: false}] },
      { q: "Which has higher precedence?", options: [{t: "+ (addition)", c: false}, {t: "* (multiplication)", c: true}, {t: "= (assignment)", c: false}, {t: "&& (logical AND)", c: false}] },
      { q: "Result of `true || (1/0 > 0)` in Java?", options: [{t: "ArithmeticException at runtime", c: false}, {t: "true (right side never evaluated due to short-circuit)", c: true}, {t: "false", c: false}, {t: "Compile error", c: false}] },
      { q: "Can `%` be applied to `double` operands in Java?", options: [{t: "No — only integers", c: false}, {t: "Yes — `5.5 % 2.0` is legal and equals 1.5", c: true}, {t: "Only with explicit cast", c: false}, {t: "Throws ArithmeticException", c: false}] }
    ],
    code: {
      title: "Arithmetic Challenge",
      desc: "Given two integers a=15 and b=4, print their sum, product, and remainder separated by space.",
      starter: "public class Main {\n  public static void main(String[] args) {\n    int a = 15;\n    int b = 4;\n    // Print sum, product, and remainder\n    System.out.println((a+b) + \" \" + (a*b) + \" \" + (a%b));\n  }\n}",
      expected: "19 60 3\n"
    }
  },
  {
    topicTitle: "Control Statements: IF-ELSE",
    desc: "If, else-if, and switch case statements for conditional execution.",
    detailedExplanation: "Code normally executes top-to-bottom, line by line. Control statements let you skip code or make decisions based on certain conditions.\n\nThe `if` statement evaluates a boolean expression. If it's true, the block of code inside the `{}` runs. You can chain multiple conditions using `else if`, and provide a fallback using `else`.\n\nA `switch` statement is an alternative to long if-else chains when you are checking the exact value of a single variable.",
    commonConfusions: "Forgetting the `break;` keyword inside a switch statement! If you don't include `break;` at the end of a case, the code will 'fall through' and execute all the cases below it, even if they don't match.",
    mcqs: [
      { q: "Which keyword executes the alternative branch when an `if` condition is false?", options: [{t: "else", c: true}, {t: "default", c: false}, {t: "switch", c: false}, {t: "break", c: false}] },
      { q: "Can a `switch` accept a `String` value (Java 8+)?", options: [{t: "Yes", c: true}, {t: "No, never", c: false}, {t: "Only Enums work", c: false}, {t: "Only int", c: false}] },
      { q: "Which keyword exits a `switch` case immediately?", options: [{t: "continue", c: false}, {t: "break", c: true}, {t: "exit", c: false}, {t: "return — but only inside methods", c: false}] },
      { q: "What happens if you forget `break;` between two `case` labels?", options: [{t: "Compile error", c: false}, {t: "Falls through and executes the next case body too", c: true}, {t: "Throws an exception", c: false}, {t: "Skips the next case", c: false}] },
      { q: "Which types can a classic `switch` statement evaluate? (Java 11)", options: [{t: "byte/short/char/int/String/enum", c: true}, {t: "Only int", c: false}, {t: "All primitives including double", c: false}, {t: "Only String", c: false}] },
      { q: "`if (x = 5) { ... }` — what's the issue?", options: [{t: "Nothing — it works", c: false}, {t: "It assigns 5 to x — only legal for boolean assignments in Java", c: true}, {t: "Compiles fine and works as comparison", c: false}, {t: "Runtime error at execution", c: false}] },
      { q: "Where can the `default` case appear in a switch?", options: [{t: "Only at the end", c: false}, {t: "Anywhere in the switch", c: true}, {t: "Only at the start", c: false}, {t: "Outside the switch block", c: false}] },
      { q: "What does an `if (cond);` (with a stray semicolon) execute as the body?", options: [{t: "The next statement", c: false}, {t: "An empty statement — body is the `;` itself", c: true}, {t: "Compile error", c: false}, {t: "Both branches", c: false}] },
      { q: "What is a switch expression (Java 14+) used for?", options: [{t: "Returning a value directly: `int v = switch(x) { case 1 -> 10; default -> 0; };`", c: true}, {t: "Replacing all if-else chains", c: false}, {t: "Doing async work", c: false}, {t: "Pattern matching only", c: false}] },
      { q: "Which is the cleaner alternative to a long `if-else if` chain testing the same variable for exact values?", options: [{t: "Nested ifs", c: false}, {t: "switch", c: true}, {t: "for loop", c: false}, {t: "while loop", c: false}] },
      { q: "Result of `if (\"hi\".equals(s)) { ... }` if `s` is null?", options: [{t: "NullPointerException", c: false}, {t: "Returns false (no NPE — method called on literal)", c: true}, {t: "Compile error", c: false}, {t: "Returns true", c: false}] },
      { q: "How many statements can the body of an `if` contain without braces `{}`?", options: [{t: "Exactly one", c: true}, {t: "Up to three", c: false}, {t: "Unlimited", c: false}, {t: "Zero", c: false}] }
    ],
    code: {
      title: "Even or Odd",
      desc: "Write a program that prints 'Even' if number is 10, otherwise 'Odd'.",
      starter: "public class Main {\n  public static void main(String[] args) {\n    int num = 10;\n    if(num % 2 == 0) {\n      System.out.println(\"Even\");\n    } else {\n      System.out.println(\"Odd\");\n    }\n  }\n}",
      expected: "Even\n"
    }
  },
  {
    topicTitle: "Loops: For & While",
    desc: "Iteration using for, while, do-while loops, break and continue.",
    detailedExplanation: "Loops let you run the same block of code multiple times without copying and pasting it.\n\n- Use a `for` loop when you know exactly how many times you want to loop (e.g., repeating 10 times).\n- Use a `while` loop when you want to loop until a condition becomes false (e.g., read the file until the end).\n- A `do-while` loop is exactly like a while loop, except it is guaranteed to execute at least ONE time before checking the condition.",
    commonConfusions: "Infinite loops! A very common mistake is forgetting to update your loop variable inside a `while` loop (like doing `i++`). If your condition never becomes false, the program will freeze looping forever.",
    mcqs: [
      { q: "Which loop is guaranteed to execute its body at least once?", options: [{t: "for", c: false}, {t: "while", c: false}, {t: "do-while", c: true}, {t: "enhanced for-each", c: false}] },
      { q: "Which keyword skips the rest of the current iteration but stays in the loop?", options: [{t: "break", c: false}, {t: "continue", c: true}, {t: "pass", c: false}, {t: "next", c: false}] },
      { q: "Is `for(;;)` a valid infinite loop in Java?", options: [{t: "Yes — empty init/cond/step", c: true}, {t: "No, syntax error", c: false}, {t: "Only in C/C++", c: false}, {t: "Compiles but runs once", c: false}] },
      { q: "When does a `while` loop check its condition?", options: [{t: "Before every iteration (including the first)", c: true}, {t: "After every iteration only", c: false}, {t: "Once at the start", c: false}, {t: "Only when `continue` is used", c: false}] },
      { q: "What is the scope of a variable declared in `for(int i=0; i<n; i++)`?", options: [{t: "The entire method", c: false}, {t: "Only inside the for-loop body and header", c: true}, {t: "Globally accessible", c: false}, {t: "Class-level", c: false}] },
      { q: "Which loop is best when iterating over an array or collection without needing the index?", options: [{t: "Plain for", c: false}, {t: "while", c: false}, {t: "Enhanced for-each", c: true}, {t: "do-while", c: false}] },
      { q: "What happens if you call `list.remove(item)` inside a `for-each` loop on the same list?", options: [{t: "Removes safely", c: false}, {t: "Throws ConcurrentModificationException", c: true}, {t: "Compile error", c: false}, {t: "Skips that element silently", c: false}] },
      { q: "Which keyword exits the innermost loop completely?", options: [{t: "continue", c: false}, {t: "break", c: true}, {t: "return — exits method only", c: false}, {t: "exit", c: false}] },
      { q: "How can you break out of a NESTED loop in one shot?", options: [{t: "Use a labeled break: `outer: for(...) { ... break outer; }`", c: true}, {t: "Multiple `break` statements", c: false}, {t: "`super.break()`", c: false}, {t: "It is not possible", c: false}] },
      { q: "What is the type of `n` in `for (int n : new int[]{1,2,3})`?", options: [{t: "int (the element value)", c: true}, {t: "int[] (the whole array)", c: false}, {t: "Integer", c: false}, {t: "Iterator<Integer>", c: false}] },
      { q: "Are all three sections of a `for` header (init; cond; step) required?", options: [{t: "Yes", c: false}, {t: "No — any can be empty", c: true}, {t: "Only init is required", c: false}, {t: "Only cond is required", c: false}] },
      { q: "What does `do { x++; } while(x < 0);` print if x starts at 5?", options: [{t: "Loops forever", c: false}, {t: "Executes the body once (x becomes 6) then exits", c: true}, {t: "Skips body entirely", c: false}, {t: "Compile error", c: false}] }
    ],
    code: {
      title: "Print 1 to 5",
      desc: "Write a loop to print numbers 1 through 5, each on a new line.",
      starter: "public class Main {\n  public static void main(String[] args) {\n    for(int i=1; i<=5; i++) {\n      System.out.println(i);\n    }\n  }\n}",
      expected: "1\n2\n3\n4\n5\n"
    }
  },
  {
    topicTitle: "Arrays (1D & 2D)",
    desc: "One-Dimensional and Multi-Dimensional Arrays in Java.",
    detailedExplanation: "Instead of declaring 100 separate variables for 100 students, you can use an Array! An array is a single variable that holds multiple values of the exact same data type in a sequential memory block.\n\nArrays are Zero-Indexed, meaning the very first item is at position 0, not position 1. A 2D array is simply an 'Array of Arrays' and is usually visualized as a table with rows and columns.",
    commonConfusions: "ArrayOutOfBoundsException! If your array has a length of 5, the valid indexes are 0, 1, 2, 3, and 4. Trying to access `arr[5]` will instantly crash your program because the 5th index is actually the 6th item.",
    mcqs: [
      { q: "How do you find the length of an array `arr`?", options: [{t: "arr.size()", c: false}, {t: "arr.length()", c: false}, {t: "arr.length", c: true}, {t: "arr.count", c: false}] },
      { q: "Default value of an `int[]` element after `new int[5]`?", options: [{t: "null", c: false}, {t: "0", c: true}, {t: "undefined", c: false}, {t: "-1", c: false}] },
      { q: "What is the starting index of an array in Java?", options: [{t: "1", c: false}, {t: "0", c: true}, {t: "-1", c: false}, {t: "Implementation-specific", c: false}] },
      { q: "Which exception is thrown by `arr[5]` on an array of length 5?", options: [{t: "NullPointerException", c: false}, {t: "ArrayIndexOutOfBoundsException", c: true}, {t: "IndexException", c: false}, {t: "RangeException", c: false}] },
      { q: "Are arrays in Java objects?", options: [{t: "No — they are primitives", c: false}, {t: "Yes — they extend Object", c: true}, {t: "Only 2D arrays are objects", c: false}, {t: "Only arrays of objects", c: false}] },
      { q: "Default value of a `String[]` element after `new String[3]`?", options: [{t: "\"\" (empty string)", c: false}, {t: "null", c: true}, {t: "undefined", c: false}, {t: "Throws NPE", c: false}] },
      { q: "Which is the correct way to declare a 2D array of ints?", options: [{t: "int arr[][];", c: true}, {t: "int[2][2] arr;", c: false}, {t: "int arr<2,2>;", c: false}, {t: "int{}{} arr;", c: false}] },
      { q: "After `int[][] m = new int[3][];` what is the value of `m[0]`?", options: [{t: "An empty int array", c: false}, {t: "null (rows are not allocated yet)", c: true}, {t: "{0,0,0}", c: false}, {t: "Compile error", c: false}] },
      { q: "Can you change an array's length after it is created?", options: [{t: "Yes, with arr.resize()", c: false}, {t: "No — length is fixed at construction", c: true}, {t: "Yes, by reassigning length", c: false}, {t: "Only via reflection", c: false}] },
      { q: "Worst-case time complexity of `Arrays.sort(int[])` (a primitive array)?", options: [{t: "O(N log N)", c: false}, {t: "O(N²)", c: true}, {t: "O(N)", c: false}, {t: "O(log N)", c: false}] },
      { q: "What does `arr.clone()` produce for `int[] arr`?", options: [{t: "A reference to the same array", c: false}, {t: "A new array with copied elements (shallow copy)", c: true}, {t: "A deep copy of nested arrays", c: false}, {t: "Compile error", c: false}] },
      { q: "Which utility copies a range of elements between arrays efficiently?", options: [{t: "System.arraycopy", c: true}, {t: "Arrays.fill", c: false}, {t: "Object.clone", c: false}, {t: "Memory.copy", c: false}] }
    ],
    code: {
      title: "Array Sum",
      desc: "Given array {1, 2, 3}, print their sum.",
      starter: "public class Main {\n  public static void main(String[] args) {\n    int[] arr = {1, 2, 3};\n    int sum = 0;\n    for(int n : arr) sum += n;\n    System.out.println(sum);\n  }\n}",
      expected: "6\n"
    }
  },
  {
    topicTitle: "Classes & Objects",
    desc: "Introduction to OOPs, Classes, Objects, state and behaviors.",
    detailedExplanation: "Object-Oriented Programming (OOP) is about creating code that targets real-world objects.\n\nThink of a `Class` as a blueprint or template (e.g., the architectural blueprint for a house). An `Object` is an actual instance created from that blueprint (e.g., an actual physical house built from the blueprint).\n\nA class has two main things:\n- Attributes / Fields (the state of the object, like color or speed)\n- Methods (the behavior of the object, like start() or park())",
    commonConfusions: "Using the `static` keyword incorrectly. If a variable is `static`, it belongs to the Blueprint (Class) itself, not to any specific House (Object). That means all objects share exactly one copy of that variable.",
    mcqs: [
      { q: "What is an instance of a class called?", options: [{t: "Function", c: false}, {t: "Variable", c: false}, {t: "Object", c: true}, {t: "Method", c: false}] },
      { q: "Which keyword creates a new object instance in Java?", options: [{t: "create", c: false}, {t: "new", c: true}, {t: "class", c: false}, {t: "object", c: false}] },
      { q: "Is Java purely object-oriented?", options: [{t: "Yes — everything is an object", c: false}, {t: "No — because of primitive types like int, char", c: true}, {t: "No — because of pointers", c: false}, {t: "Only after Java 8", c: false}] },
      { q: "What is the relationship between a class and an object?", options: [{t: "Class is the blueprint; object is the instance", c: true}, {t: "They are the same thing", c: false}, {t: "Object is the blueprint; class is the instance", c: false}, {t: "Class is dynamic; object is static", c: false}] },
      { q: "What are the two main parts of a class definition?", options: [{t: "Fields (state) and Methods (behavior)", c: true}, {t: "Constructors and Destructors", c: false}, {t: "Public and Private", c: false}, {t: "Variables and Loops", c: false}] },
      { q: "How do you call an instance method on an object `d` of class `Dog`?", options: [{t: "Dog.bark()", c: false}, {t: "d.bark()", c: true}, {t: "d->bark()", c: false}, {t: "bark(d)", c: false}] },
      { q: "What does `==` compare when applied to two object references?", options: [{t: "Whether they are the same reference (point to same object)", c: true}, {t: "Whether they have equal contents", c: false}, {t: "Their class names", c: false}, {t: "Always returns true", c: false}] },
      { q: "Which method should you override to define logical equality between objects?", options: [{t: "compareTo()", c: false}, {t: "equals()", c: true}, {t: "toString()", c: false}, {t: "clone()", c: false}] },
      { q: "What is the default value of a non-initialized object reference field?", options: [{t: "0", c: false}, {t: "null", c: true}, {t: "An empty object", c: false}, {t: "Compile error", c: false}] },
      { q: "Memory for a new object is allocated on:", options: [{t: "The stack", c: false}, {t: "The heap", c: true}, {t: "The metaspace", c: false}, {t: "A static area", c: false}] },
      { q: "Naming convention for Java class names?", options: [{t: "snake_case", c: false}, {t: "camelCase", c: false}, {t: "PascalCase / UpperCamelCase", c: true}, {t: "ALL_CAPS", c: false}] },
      { q: "If you don't override `toString()`, what does the default print look like?", options: [{t: "An empty string", c: false}, {t: "ClassName@hexHashCode (e.g., Dog@1b6d3586)", c: true}, {t: "The class name only", c: false}, {t: "null", c: false}] }
    ],
    code: {
      title: "Create an Object",
      desc: "Create a Dog class with method bark() that prints 'Woof'. Call it in main.",
      starter: "class Dog {\n  public void bark() {\n    System.out.println(\"Woof\");\n  }\n}\n\npublic class Main {\n  public static void main(String[] args) {\n    Dog d = new Dog();\n    d.bark();\n  }\n}",
      expected: "Woof\n"
    }
  },
  {
    topicTitle: "Constructors & This Keyword",
    desc: "Constructors, Parameterized constructors, Garbage Collection, the 'this' keyword.",
    detailedExplanation: "A Constructor is a special method used to initialize objects. It is called automatically exactly once when the object is created using `new`. \n\nRules for constructors:\n1. The name MUST exactly match the Class name.\n2. It CANNOT have a return type (not even void!).\n\nThe `this` keyword is a reference to the 'current object'. It's used inside the class to say 'my own variable' when a method parameter has the exact same name.",
    commonConfusions: "If you do not write a constructor, Java silently creates an invisible 'Default Constructor' for you. BUT, the moment you write any custom constructor (like one that takes a String name), Java stops making the default one. You must explicitly write an empty constructor if you still want it!",
    mcqs: [
      { q: "What is the return type of a constructor?", options: [{t: "void", c: false}, {t: "int", c: false}, {t: "None — constructors have no return type", c: true}, {t: "Object", c: false}] },
      { q: "What name must a constructor have?", options: [{t: "Anything you choose", c: false}, {t: "Exactly the class name", c: true}, {t: "Always `init`", c: false}, {t: "Always `Constructor`", c: false}] },
      { q: "Which keyword distinguishes an instance field from a same-named parameter?", options: [{t: "super", c: false}, {t: "self", c: false}, {t: "this", c: true}, {t: "static", c: false}] },
      { q: "When does Java auto-generate a default no-arg constructor?", options: [{t: "Always", c: false}, {t: "Only when no constructor is defined explicitly", c: true}, {t: "Only for abstract classes", c: false}, {t: "Never", c: false}] },
      { q: "Can you overload constructors in Java?", options: [{t: "Yes — multiple constructors with different parameter lists", c: true}, {t: "No — only one constructor per class", c: false}, {t: "Only in abstract classes", c: false}, {t: "Only via inheritance", c: false}] },
      { q: "How does one constructor call another constructor in the same class?", options: [{t: "Using `this(args)` as the FIRST statement", c: true}, {t: "By calling `Class()`", c: false}, {t: "Using `super()`", c: false}, {t: "Constructors cannot call each other", c: false}] },
      { q: "Where MUST `super(...)` or `this(...)` appear in a constructor body?", options: [{t: "Anywhere in the body", c: false}, {t: "As the first statement", c: true}, {t: "As the last statement", c: false}, {t: "It is optional and order doesn't matter", c: false}] },
      { q: "Can a constructor be declared `private`?", options: [{t: "No — must be public", c: false}, {t: "Yes — useful for Singleton / static factory patterns", c: true}, {t: "Only in abstract classes", c: false}, {t: "Only with @SuppressWarnings", c: false}] },
      { q: "Can a constructor be declared `final`?", options: [{t: "Yes", c: false}, {t: "No — constructors cannot be final", c: true}, {t: "Only in inner classes", c: false}, {t: "Only if the class is final", c: false}] },
      { q: "What runs before the constructor body when an object is instantiated?", options: [{t: "Static initializers (only first time class loads), then instance initializers", c: true}, {t: "Nothing", c: false}, {t: "The garbage collector", c: false}, {t: "main()", c: false}] },
      { q: "What invokes garbage collection in Java?", options: [{t: "`new` keyword", c: false}, {t: "`System.gc()` is a hint, but the JVM decides", c: true}, {t: "The destructor", c: false}, {t: "Manual `delete` keyword", c: false}] },
      { q: "When is an object eligible for garbage collection?", options: [{t: "When it goes out of scope only", c: false}, {t: "When no live thread holds a reference to it", c: true}, {t: "After `System.gc()` is called", c: false}, {t: "Only at JVM shutdown", c: false}] }
    ],
    code: {
      title: "Parameterized Constructor",
      desc: "Create a Box with width. Initialize via constructor and print width.",
      starter: "class Box {\n  int width;\n  Box(int w) {\n    this.width = w;\n  }\n}\n\npublic class Main {\n  public static void main(String[] args) {\n    Box b = new Box(10);\n    System.out.println(b.width);\n  }\n}",
      expected: "10\n"
    }
  },
  {
    topicTitle: "Encapsulation & Access Modifiers",
    desc: "Information Hiding, getters/setters, default, private, public, protected modifiers.",
    detailedExplanation: "Encapsulation is like a protective shield that prevents the data from being accessed by the code outside this shield. You achieve this in Java by making your class variables `private`.\n\nSince they are private, other classes can't touch them directly. Instead, you provide `public` Getter and Setter methods. This allows you, the programmer, to add rules (like ensuring a user's age cannot be set to a negative number).",
    commonConfusions: "Thinking encapsulation is just 'making things private'. The real power is validation! In your setter `public void setAge(int a)`, you can write `if (a > 0) age = a;`. If the variable was public, anyone could do `user.age = -100;` and break your app.",
    mcqs: [
      { q: "Which access modifier restricts access to the same class only?", options: [{t: "public", c: false}, {t: "protected", c: false}, {t: "private", c: true}, {t: "default (package-private)", c: false}] },
      { q: "Which OOP concept binds data and the code that operates on it together inside one unit?", options: [{t: "Polymorphism", c: false}, {t: "Encapsulation", c: true}, {t: "Inheritance", c: false}, {t: "Abstraction", c: false}] },
      { q: "Which modifiers do interface fields implicitly carry?", options: [{t: "public static final", c: true}, {t: "private", c: false}, {t: "protected", c: false}, {t: "Must be declared explicitly", c: false}] },
      { q: "What is the access scope of `protected`?", options: [{t: "Same package + subclasses (even outside package)", c: true}, {t: "Same class only", c: false}, {t: "Anywhere", c: false}, {t: "Same package only", c: false}] },
      { q: "What is the access scope of default (no modifier)?", options: [{t: "Same package only", c: true}, {t: "Same class only", c: false}, {t: "Subclasses only", c: false}, {t: "Anywhere", c: false}] },
      { q: "Which is the MOST restrictive access modifier?", options: [{t: "public", c: false}, {t: "protected", c: false}, {t: "default", c: false}, {t: "private", c: true}] },
      { q: "Which access modifiers are valid for a TOP-LEVEL class?", options: [{t: "public or default (package-private) only", c: true}, {t: "Any modifier", c: false}, {t: "Only public", c: false}, {t: "Only private", c: false}] },
      { q: "Why use a setter method instead of a public field?", options: [{t: "Setters can validate input and add invariants", c: true}, {t: "Setters are faster", c: false}, {t: "Public fields cause compile errors", c: false}, {t: "Convention only — no real reason", c: false}] },
      { q: "Convention for a getter on a `boolean` field named `enabled`?", options: [{t: "getEnabled()", c: false}, {t: "isEnabled()", c: true}, {t: "fetchEnabled()", c: false}, {t: "enabled()", c: false}] },
      { q: "A class with a `private` constructor cannot be:", options: [{t: "Instantiated from outside the class (good for Singletons / utility classes)", c: true}, {t: "Compiled", c: false}, {t: "Used at all", c: false}, {t: "Inherited from", c: false}] },
      { q: "Which is the strongest example of encapsulation?", options: [{t: "Public fields, public methods", c: false}, {t: "Private fields with controlled access via public methods", c: true}, {t: "All fields static", c: false}, {t: "No fields, only methods", c: false}] },
      { q: "Encapsulation enables:", options: [{t: "Information hiding and easier maintenance", c: true}, {t: "Faster execution", c: false}, {t: "Multiple inheritance", c: false}, {t: "Removing the need for classes", c: false}] }
    ],
    code: {
      title: "Getter and Setter",
      desc: "Use a setter to update private age to 20, then print via getter.",
      starter: "class Person {\n  private int age;\n  public void setAge(int a) { age = a; }\n  public int getAge() { return age; }\n}\n\npublic class Main {\n  public static void main(String[] args) {\n    Person p = new Person();\n    p.setAge(20);\n    System.out.println(p.getAge());\n  }\n}",
      expected: "20\n"
    }
  },
  {
    topicTitle: "Inheritance Basics",
    desc: "Single, Multilevel inheritance, IS-A relationship, super keyword.",
    detailedExplanation: "Inheritance allows a new class (Subclass/Child) to inherit the properties and methods of an existing class (Superclass/Parent). It represents an 'IS-A' relationship (e.g., A Dog IS-A Animal).\n\nYou use the `extends` keyword to inherit. This prevents duplicate code. If you have a generic `Vehicle` with wheels and an engine, your `Car` class can just extend `Vehicle` and automatically gain all those properties without rewriting them.",
    commonConfusions: "Multiple Inheritance! In Java, a class CANNOT extend more than one parent directly (you can't do `class Child extends Mom, Dad`). This prevents the 'Diamond Problem'. To get around this, Java uses Interfaces.",
    mcqs: [
      { q: "Which keyword inherits one class from another?", options: [{t: "implements", c: false}, {t: "inherits", c: false}, {t: "extends", c: true}, {t: "super", c: false}] },
      { q: "Does Java support multiple inheritance via classes?", options: [{t: "Yes", c: false}, {t: "No — but you can implement multiple interfaces", c: true}, {t: "Only in Java 8+", c: false}, {t: "Only with the `final` keyword", c: false}] },
      { q: "Which class is the root of every Java class hierarchy?", options: [{t: "Main", c: false}, {t: "System", c: false}, {t: "Object", c: true}, {t: "Class", c: false}] },
      { q: "Can a `final` class be subclassed?", options: [{t: "Yes", c: false}, {t: "No — `final` prevents inheritance", c: true}, {t: "Only by abstract classes", c: false}, {t: "Only within the same package", c: false}] },
      { q: "What does `super` refer to inside a subclass?", options: [{t: "The current object", c: false}, {t: "The parent class — for accessing parent fields/methods/constructor", c: true}, {t: "A static field", c: false}, {t: "The Object class only", c: false}] },
      { q: "What relationship does `class Dog extends Animal` represent?", options: [{t: "HAS-A", c: false}, {t: "IS-A (Dog IS-A Animal)", c: true}, {t: "USES-A", c: false}, {t: "PART-OF", c: false}] },
      { q: "Are `private` members of the parent inherited by the child?", options: [{t: "No — they exist in the object but are not directly accessible", c: true}, {t: "Yes — fully accessible", c: false}, {t: "Only if `protected`", c: false}, {t: "Only with `super`", c: false}] },
      { q: "Are constructors inherited?", options: [{t: "Yes", c: false}, {t: "No — but the child constructor must call a parent constructor (super) implicitly or explicitly", c: true}, {t: "Only no-arg constructors", c: false}, {t: "Only public ones", c: false}] },
      { q: "Why does Java use interfaces to achieve multiple inheritance?", options: [{t: "Because classes are too slow", c: false}, {t: "To avoid the diamond problem of multiple class inheritance", c: true}, {t: "For performance only", c: false}, {t: "Required by the JVM", c: false}] },
      { q: "What does a method override require in the subclass?", options: [{t: "Same name, same parameter list, compatible return type", c: true}, {t: "Different name", c: false}, {t: "Different parameters", c: false}, {t: "Static modifier", c: false}] },
      { q: "What does the `@Override` annotation do?", options: [{t: "Tells the compiler to verify the method actually overrides a parent method — catches typos", c: true}, {t: "Forces a method to be overridden", c: false}, {t: "Makes the method final", c: false}, {t: "Required for inheritance", c: false}] },
      { q: "Implicit casting between parent and child:", options: [{t: "Both directions are implicit", c: false}, {t: "Subclass → Superclass is implicit (upcast); the reverse needs an explicit cast (downcast)", c: true}, {t: "Both require explicit casts", c: false}, {t: "Casting between them is not allowed", c: false}] }
    ],
    code: {
      title: "Superclass Method call",
      desc: "Call a parent class method using 'extends'.",
      starter: "class Parent {\n  void hello() { System.out.println(\"Hi Parent\"); }\n}\nclass Child extends Parent {}\n\npublic class Main {\n  public static void main(String[] args) {\n    Child c = new Child();\n    c.hello();\n  }\n}",
      expected: "Hi Parent\n"
    }
  }
];

// Fallback topics for 11-40 (intermediate Java curriculum)
const fallbackTopics = [
  'Method Overriding & Polymorphism', 'Abstract Classes', 'Interfaces in Java',
  'Static Keyword', 'Final Keyword', 'Exception Handling (try-catch)',
  'Throw & Throws', 'Custom Exceptions', 'File Handling (Reading)',
  'File Handling (Writing)', 'Java Generics', 'Enums', 'Date and Time API',
  'Collection Framework Overview', 'ArrayLists in Java', 'LinkedLists',
  'HashSets', 'HashMaps', 'Iterators & For-Each Loop',
  'Lambda Expressions', 'Stream API Basics', 'Multithreading Basics', 'Building a Java API'
];

// Days 41-50: hand-crafted "Java for Interviews" placement-focused finale.
// These are the actual Java questions tier-3 placements ask.
const placementJavaDays = [
  {
    topicTitle: 'equals() and hashCode() Contract',
    desc: 'Why overriding one without the other breaks HashSet/HashMap, and how to do it correctly.',
    detailedExplanation: "Java's `equals()` and `hashCode()` are bound by a strict contract:\n\n1. If two objects are equal (`a.equals(b) == true`), they MUST have the same hash code.\n2. If two objects have the same hash code, they need NOT be equal (collisions are allowed).\n\nWhen you override `equals()` you MUST also override `hashCode()`. Otherwise, your objects will misbehave inside `HashSet`, `HashMap`, and any hashed collection — adding the same logical object twice will store it twice, lookups will silently fail.\n\nUse `Objects.hash(field1, field2, ...)` for a clean implementation.",
    commonConfusions: "The most common bug: overriding `equals()` only, then putting objects into a HashSet. Two equal objects get stored separately because their hash codes differ → set.contains() returns false even though it logically shouldn't.",
    mcqs: [
      { q: 'If you override equals() in a class, what else MUST you override?', options: [{ t: 'toString()', c: false }, { t: 'hashCode()', c: true }, { t: 'compareTo()', c: false }, { t: 'clone()', c: false }] },
      { q: 'Two objects have the same hashCode — what can you conclude?', options: [{ t: 'They must be equal', c: false }, { t: 'They MIGHT be equal — hash collisions are allowed', c: true }, { t: 'They are at the same memory address', c: false }, { t: 'It is always a bug', c: false }] },
      { q: 'You override equals() but NOT hashCode(). Most likely consequence?', options: [{ t: 'Compile error', c: false }, { t: 'Objects misbehave in HashMap / HashSet (lookups silently fail)', c: true }, { t: 'Nothing — they are independent', c: false }, { t: 'JVM auto-generates hashCode()', c: false }] },
      { q: 'Which of these is a clean way to implement hashCode() for a class with fields x and y?', options: [{ t: 'return x + y;', c: false }, { t: 'return Objects.hash(x, y);', c: true }, { t: 'return 1;', c: false }, { t: 'return super.hashCode();', c: false }] },
      { q: 'The equals contract requires which property: a.equals(a) is always true. This is called:', options: [{ t: 'Symmetric', c: false }, { t: 'Reflexive', c: true }, { t: 'Transitive', c: false }, { t: 'Consistent', c: false }] },
      { q: 'a.equals(b) is true → b.equals(a) must be true. This property is:', options: [{ t: 'Reflexive', c: false }, { t: 'Symmetric', c: true }, { t: 'Transitive', c: false }, { t: 'Consistent', c: false }] },
      { q: 'Two equal objects must have equal hashCodes. What is NOT required?', options: [{ t: 'Two unequal objects must have different hashCodes', c: true }, { t: 'a.equals(a) returns true', c: false }, { t: 'a.equals(b) ⇔ b.equals(a)', c: false }, { t: 'Equal objects have equal hashCodes', c: false }] },
      { q: 'Default Object.equals() in Java compares:', options: [{ t: 'Field values', c: false }, { t: 'References (same as ==)', c: true }, { t: 'Class names', c: false }, { t: 'String form', c: false }] },
      { q: 'What does Object.hashCode() return by default?', options: [{ t: 'Always 0', c: false }, { t: 'A value derived from the memory address / identity', c: true }, { t: 'The class name hash', c: false }, { t: 'A random number', c: false }] },
      { q: 'When mutating a field that contributes to hashCode AFTER inserting an object into a HashSet, what happens?', options: [{ t: 'The set re-hashes automatically', c: false }, { t: 'The object is "lost" — set.contains(obj) returns false', c: true }, { t: 'A ConcurrentModificationException is thrown', c: false }, { t: 'Nothing changes', c: false }] },
      { q: 'You should typically use which fields in equals() and hashCode()?', options: [{ t: 'Only mutable fields', c: false }, { t: 'A consistent set of fields used in BOTH (preferably immutable)', c: true }, { t: 'All static fields', c: false }, { t: 'Whatever you want — they are independent', c: false }] },
      { q: 'For a class used as a HashMap KEY, the safest hashCode strategy is:', options: [{ t: 'Build it from final/immutable fields', c: true }, { t: 'Use a random number per instance', c: false }, { t: 'Hash the toString()', c: false }, { t: 'Override only equals()', c: false }] }
    ],
    code: {
      title: 'Override equals() and hashCode()',
      desc: 'Override both methods on a `Point` class so two points with the same x,y are considered equal AND hash to the same bucket.',
      starter: "import java.util.Objects;\n\nclass Point {\n  int x, y;\n  Point(int x, int y) { this.x = x; this.y = y; }\n\n  // TODO: override equals() and hashCode()\n}\n\npublic class Main {\n  public static void main(String[] args) {\n    Point a = new Point(1, 2);\n    Point b = new Point(1, 2);\n    System.out.println(a.equals(b));            // expected: true\n    System.out.println(a.hashCode() == b.hashCode()); // expected: true\n  }\n}",
      expected: 'true\ntrue\n'
    },
    predict: [
      {
        codeSnippet: "import java.util.HashSet;\nclass Box {\n  int n;\n  Box(int n) { this.n = n; }\n  @Override public boolean equals(Object o) {\n    return o instanceof Box && ((Box)o).n == n;\n  }\n  // hashCode not overridden\n}\npublic class T {\n  public static void main(String[] a) {\n    HashSet<Box> s = new HashSet<>();\n    s.add(new Box(5));\n    System.out.println(s.contains(new Box(5)));\n  }\n}",
        expectedOutput: 'false',
        explanation: "Because hashCode() is not overridden, two `Box(5)` instances have different default hash codes. HashSet looks in different buckets → contains returns false. This is the classic equals-without-hashCode bug."
      }
    ]
  },
  {
    topicTitle: 'Immutability and the final Keyword',
    desc: 'How to design truly immutable classes, why String is immutable, and the role of `final`.',
    detailedExplanation: "An immutable object's state cannot change after construction. To make a class immutable:\n\n1. Mark the class `final` (so it can't be subclassed and have mutability added).\n2. Make all fields `private final`.\n3. Don't expose setters.\n4. For mutable field types (like List, Date), defensive-copy on the way in (constructor) and on the way out (getters).\n\n`String`, `Integer`, and all wrapper types are immutable in Java. That's why `s.toUpperCase()` returns a new String — the original is never modified.\n\n`final` on a variable means the reference can't be reassigned — it does NOT make the pointed-to object immutable.",
    commonConfusions: "`final List<Integer> list = new ArrayList<>();` does NOT make the list immutable — you can still call `list.add(x)`. `final` only locks the reference, not the object's state. For an unmodifiable list, use `List.copyOf()` or `Collections.unmodifiableList()`.",
    mcqs: [
      { q: 'Which of the following is required to make a class truly immutable?', options: [{ t: 'Make all methods static', c: false }, { t: 'Mark class final, fields private final, no setters, defensively copy mutable fields', c: true }, { t: 'Mark every method synchronized', c: false }, { t: 'Inherit from an Immutable interface', c: false }] },
      { q: '`final List<Integer> list = new ArrayList<>(); list.add(5);` — what happens?', options: [{ t: 'Compile error', c: false }, { t: 'Runtime exception', c: false }, { t: 'Works fine — final locks the reference, not the contents', c: true }, { t: 'UnsupportedOperationException', c: false }] },
      { q: 'Why is String immutable in Java?', options: [{ t: 'Thread safety, security (Map keys, classloaders), string pool optimization', c: true }, { t: 'To save memory only', c: false }, { t: 'It is not — you can modify Strings', c: false }, { t: 'Historical accident', c: false }] },
      { q: 'What is "defensive copying" used for in immutable classes?', options: [{ t: 'To copy mutable fields on the way in (constructor) and on the way out (getters)', c: true }, { t: 'To clone the entire JVM', c: false }, { t: 'To prevent reflection', c: false }, { t: 'To boost performance', c: false }] },
      { q: 'Marking a CLASS `final` does what?', options: [{ t: 'Prevents subclassing', c: true }, { t: 'Makes all fields immutable', c: false }, { t: 'Makes all methods abstract', c: false }, { t: 'Has no effect', c: false }] },
      { q: 'Marking a METHOD `final` does what?', options: [{ t: 'Prevents overriding in subclasses', c: true }, { t: 'Prevents calling it', c: false }, { t: 'Makes it static', c: false }, { t: 'Makes it abstract', c: false }] },
      { q: 'Which class is mutable but often confused as immutable?', options: [{ t: 'StringBuilder', c: true }, { t: 'String', c: false }, { t: 'Integer', c: false }, { t: 'LocalDate', c: false }] },
      { q: 'Best return type for an immutable view of a List?', options: [{ t: 'Collections.unmodifiableList(internal) or List.copyOf(internal)', c: true }, { t: 'The internal list directly', c: false }, { t: 'A new ArrayList', c: false }, { t: 'null', c: false }] },
      { q: 'Wrapper types like Integer, Long, Double are:', options: [{ t: 'Mutable', c: false }, { t: 'Immutable', c: true }, { t: 'Sometimes mutable', c: false }, { t: 'Same as their primitives', c: false }] },
      { q: 'Why are immutable objects naturally thread-safe?', options: [{ t: 'Their state cannot change after construction — no synchronization needed for reads', c: true }, { t: 'They use synchronized internally', c: false }, { t: 'They run on a separate thread', c: false }, { t: 'They are static', c: false }] },
      { q: '`final` on a parameter inside a method means:', options: [{ t: 'It is a constant for the JVM', c: false }, { t: 'It cannot be reassigned inside the method body', c: true }, { t: 'It is automatically passed by reference', c: false }, { t: 'It is returned to the caller', c: false }] },
      { q: 'Java records (Java 14+) are:', options: [{ t: 'Compact, immutable data carriers — automatic equals/hashCode/toString', c: true }, { t: 'Mutable POJOs', c: false }, { t: 'A type of interface', c: false }, { t: 'Replaced by Lombok', c: false }] }
    ],
    code: {
      title: 'Build an Immutable Person',
      desc: "Make `Person` truly immutable. Defensive-copy any incoming/outgoing collections.",
      starter: "import java.util.*;\n\nfinal class Person {\n  // TODO: private final fields, defensive copy in constructor and getter\n  public Person(String name, List<String> hobbies) {\n  }\n  public String getName() { return null; }\n  public List<String> getHobbies() { return null; }\n}\n\npublic class Main {\n  public static void main(String[] args) {\n    List<String> hobbies = new ArrayList<>(List.of(\"chess\", \"hiking\"));\n    Person p = new Person(\"Aarav\", hobbies);\n    hobbies.add(\"coding\"); // should NOT affect p\n    System.out.println(p.getHobbies().size()); // expected: 2\n  }\n}",
      expected: '2\n'
    }
  },
  {
    topicTitle: 'Singleton — Four Implementations',
    desc: 'The classic creational pattern. Eager init, lazy init, double-checked locking, and the enum trick.',
    detailedExplanation: "Singleton ensures a class has exactly one instance and provides global access to it.\n\n**Four common implementations:**\n\n1. **Eager initialization** — `private static final INSTANCE = new Singleton();` Simple, thread-safe by classloader, but creates instance even if never used.\n\n2. **Lazy synchronized** — getter is `synchronized`. Thread-safe but slow because every call locks.\n\n3. **Double-checked locking with `volatile`** — checks instance twice, locks only on first creation. Fast and thread-safe but verbose.\n\n4. **Enum singleton** (Bloch's recommendation) — `public enum Singleton { INSTANCE; }`. Thread-safe, serialization-safe, reflection-safe. Use this unless you have a specific reason not to.\n\n**Real-world use cases:** logging, configuration, connection pools.",
    commonConfusions: "Naive lazy init (without synchronization) breaks under multiple threads — two threads can both see `instance == null` and create two instances. Always use a thread-safe variant in production.",
    mcqs: [
      { q: 'Which Singleton variant does Joshua Bloch recommend in "Effective Java"?', options: [{ t: 'Eager init', c: false }, { t: 'Lazy synchronized', c: false }, { t: 'Double-checked locking', c: false }, { t: 'Enum singleton', c: true }] },
      { q: 'In double-checked locking, what role does `volatile` play?', options: [{ t: 'Makes the field final', c: false }, { t: 'Prevents instruction reordering and ensures cross-thread visibility', c: true }, { t: 'Speeds up reads', c: false }, { t: 'Only required for primitives', c: false }] },
      { q: 'A naive non-synchronized lazy Singleton can be broken by:', options: [{ t: 'Reflection only', c: false }, { t: 'Concurrent calls from multiple threads creating multiple instances', c: true }, { t: 'JVM warm-up', c: false }, { t: 'Garbage collection', c: false }] },
      { q: 'What does the Singleton pattern guarantee?', options: [{ t: 'A class has exactly one instance + a global access point', c: true }, { t: 'A class has exactly one method', c: false }, { t: 'A class is immutable', c: false }, { t: 'A class cannot be inherited', c: false }] },
      { q: 'Which Singleton variant is created BEFORE it is ever used?', options: [{ t: 'Eager initialization', c: true }, { t: 'Lazy initialization', c: false }, { t: 'Double-checked locking', c: false }, { t: 'Enum singleton', c: false }] },
      { q: 'Drawback of synchronizing the entire getInstance() method?', options: [{ t: 'It is incorrect under concurrency', c: false }, { t: 'Every call locks even after the instance exists — slow under high read load', c: true }, { t: 'It is not thread-safe', c: false }, { t: 'It triggers GC', c: false }] },
      { q: 'Reflection can break a typical Singleton because:', options: [{ t: 'It is faster than `new`', c: false }, { t: 'It can invoke a private constructor with setAccessible(true)', c: true }, { t: 'It bypasses static fields', c: false }, { t: 'It calls finalize()', c: false }] },
      { q: 'Why is the enum Singleton reflection-safe?', options: [{ t: 'JVM forbids reflective construction of enum constants', c: true }, { t: 'It uses synchronization', c: false }, { t: 'Enums are final', c: false }, { t: 'It uses bytecode verification', c: false }] },
      { q: 'Why is the enum Singleton serialization-safe by default?', options: [{ t: 'Enum serialization preserves singleton invariant — readResolve handled by JVM', c: true }, { t: 'Enums cannot be serialized', c: false }, { t: 'Serialization throws on enums', c: false }, { t: 'Enums use Externalizable', c: false }] },
      { q: 'What problem do Singletons commonly cause in unit tests?', options: [{ t: 'They are too fast', c: false }, { t: 'Hidden global state — order-dependent flaky tests, hard to mock', c: true }, { t: 'They throw exceptions in tests', c: false }, { t: 'They cannot be loaded', c: false }] },
      { q: 'Bill Pugh / "Initialization-on-demand holder" Singleton uses:', options: [{ t: 'A static nested class loaded only on first access — gives lazy thread-safe init without synchronized', c: true }, { t: 'A volatile field plus locks', c: false }, { t: 'An enum', c: false }, { t: 'Reflection', c: false }] },
      { q: 'Which Singleton variant is the WORST choice for a brand-new modern codebase?', options: [{ t: 'Enum singleton', c: false }, { t: 'Bill Pugh holder', c: false }, { t: 'Old-school Hashtable-style globally-synchronized lazy init', c: true }, { t: 'Eager init', c: false }] }
    ],
    code: {
      title: 'Thread-safe Lazy Singleton',
      desc: 'Implement `Logger` as a thread-safe singleton using double-checked locking with volatile. Verify two getInstance() calls return the same reference.',
      starter: "class Logger {\n  // TODO: private static volatile Logger instance; private constructor; getInstance with double-checked locking\n  public static Logger getInstance() {\n    return null;\n  }\n  public void log(String s) { System.out.println(\"LOG: \" + s); }\n}\n\npublic class Main {\n  public static void main(String[] args) {\n    Logger a = Logger.getInstance();\n    Logger b = Logger.getInstance();\n    System.out.println(a == b); // expected: true\n  }\n}",
      expected: 'true\n'
    }
  },
  {
    topicTitle: 'Comparable vs Comparator',
    desc: "Two ways to define ordering: natural ordering on the class, or external rules supplied per-sort.",
    detailedExplanation: "**`Comparable<T>`** — implemented BY the class being sorted. Defines a single, natural ordering. Method: `compareTo(T other)`. `Collections.sort(list)` uses this.\n\n**`Comparator<T>`** — implemented OUTSIDE the class. Defines an alternative ordering, useful when you need multiple sort orders or when you can't modify the class. Method: `compare(T a, T b)`. Used as `list.sort(comparator)`.\n\n**Modern usage:** `Comparator.comparing(Person::getAge).thenComparing(Person::getName)` builds composite comparators in one line.\n\nReturn convention: negative if a < b, zero if equal, positive if a > b.",
    commonConfusions: "Don't write `return a - b` for int comparisons in `compareTo` — it overflows for large negative numbers. Use `Integer.compare(a, b)`.",
    mcqs: [
      { q: 'Which interface defines a class\'s NATURAL ordering?', options: [{ t: 'Comparator', c: false }, { t: 'Comparable', c: true }, { t: 'Sortable', c: false }, { t: 'Iterable', c: false }] },
      { q: 'You need to sort the same `Person` list by age in one place and by name in another. Use:', options: [{ t: 'Two implementations of Comparable', c: false }, { t: 'Two Comparators', c: true }, { t: 'Override toString() differently', c: false }, { t: 'Reflection', c: false }] },
      { q: 'Why is `return a - b` risky inside compareTo?', options: [{ t: 'Slower than Integer.compare', c: false }, { t: 'Subtraction can overflow for extreme negative values', c: true }, { t: 'Returns wrong sign', c: false }, { t: 'It does not compile', c: false }] },
      { q: 'What is the contract for compareTo / compare return values?', options: [{ t: 'Negative if a<b, zero if equal, positive if a>b', c: true }, { t: '-1 / 0 / 1 strictly', c: false }, { t: 'true / false', c: false }, { t: 'Any int — sign does not matter', c: false }] },
      { q: 'Which method does Comparator define?', options: [{ t: 'compareTo(T)', c: false }, { t: 'compare(T a, T b)', c: true }, { t: 'order(T)', c: false }, { t: 'sort(T, T)', c: false }] },
      { q: 'Which method does Comparable define?', options: [{ t: 'compareTo(T other)', c: true }, { t: 'compare(T a, T b)', c: false }, { t: 'order(T)', c: false }, { t: 'sort()', c: false }] },
      { q: 'Composing comparators: which API chains a secondary key?', options: [{ t: 'Comparator.thenComparing(...)', c: true }, { t: 'Comparator.and(...)', c: false }, { t: 'Comparator.combine(...)', c: false }, { t: 'Comparator.or(...)', c: false }] },
      { q: 'Comparator.comparing(Person::getAge).reversed() does what?', options: [{ t: 'Sorts by age ascending', c: false }, { t: 'Sorts by age descending', c: true }, { t: 'Throws an exception', c: false }, { t: 'Sorts by age then by name', c: false }] },
      { q: 'A class that implements Comparable can be sorted with:', options: [{ t: 'Collections.sort(list) — no comparator needed', c: true }, { t: 'Only manual bubble sort', c: false }, { t: 'Only via Comparator', c: false }, { t: 'Only via reflection', c: false }] },
      { q: 'Inconsistency between equals() and compareTo() (compareTo == 0 but !equals) causes problems in:', options: [{ t: 'TreeSet / TreeMap (which use compareTo for uniqueness)', c: true }, { t: 'ArrayList', c: false }, { t: 'Plain HashMap', c: false }, { t: 'LinkedList', c: false }] },
      { q: 'How to handle null values in a Comparator?', options: [{ t: 'Comparator.nullsFirst(...) or Comparator.nullsLast(...)', c: true }, { t: 'Skip nulls automatically', c: false }, { t: 'Throw NullPointerException always', c: false }, { t: 'Convert nulls to empty strings', c: false }] },
      { q: 'When sorting `int[]` with custom logic, which works?', options: [{ t: 'Arrays.sort(arr, customComparator)', c: false }, { t: 'You must convert to Integer[] first — Comparator does not work on primitive arrays', c: true }, { t: 'Use Arrays.compare', c: false }, { t: 'It is not possible at all', c: false }] }
    ],
    code: {
      title: 'Sort Employees',
      desc: 'Use a Comparator to sort employees by salary descending, breaking ties alphabetically by name ascending.',
      starter: "import java.util.*;\n\nclass Emp {\n  String name; int salary;\n  Emp(String n, int s) { name = n; salary = s; }\n  public String toString() { return name + \":\" + salary; }\n}\n\npublic class Main {\n  public static void main(String[] args) {\n    List<Emp> list = new ArrayList<>(List.of(\n      new Emp(\"Diya\", 60000), new Emp(\"Aarav\", 80000), new Emp(\"Ben\", 60000)\n    ));\n    // TODO: sort by salary DESC, then name ASC\n    list.forEach(System.out::println);\n    // expected: Aarav:80000, Ben:60000, Diya:60000\n  }\n}",
      expected: 'Aarav:80000\nBen:60000\nDiya:60000\n'
    }
  },
  {
    topicTitle: 'Pass-by-Value: The Classic Gotcha',
    desc: "Java is strictly pass-by-value — but for object references the *value* IS the reference. This is THE most-asked Java interview gotcha.",
    detailedExplanation: "Java passes arguments by VALUE. Always. There is no pass-by-reference in Java.\n\n- For primitives (int, double, char): the value is copied. The method receives a fresh copy. Reassignments inside don't affect the caller.\n\n- For objects: the *reference value* is copied. Both the caller's variable and the parameter point to the SAME object. Mutating the object via the parameter IS visible to the caller. But REASSIGNING the parameter (`p = new Person(...)`) only changes the local copy.\n\nThis is why you can call `list.add(x)` inside a method and the caller sees the change, but `list = new ArrayList<>()` inside the method does not.",
    commonConfusions: "People say 'Java is pass-by-reference for objects'. WRONG — it's still pass-by-value, where the value being passed is the reference. The distinction matters when you reassign vs mutate.",
    mcqs: [
      { q: 'Java argument passing is:', options: [{ t: 'Pass-by-reference for objects', c: false }, { t: 'Pass-by-value, always — but for objects the value IS the reference', c: true }, { t: 'Pass-by-name', c: false }, { t: 'Depends on the JVM', c: false }] },
      { q: 'void modify(int n) { n = 99; } — caller passes x = 5. After the call, x is:', options: [{ t: '5', c: true }, { t: '99', c: false }, { t: 'undefined', c: false }, { t: 'Compile error', c: false }] },
      { q: 'void rename(Person p) { p.name = "X"; } — does the caller see the change?', options: [{ t: 'Yes — both refs point to the same object', c: true }, { t: 'No — Java is pass-by-value', c: false }, { t: 'Only if Person is final', c: false }, { t: 'Throws an exception', c: false }] },
      { q: 'void reassign(Person p) { p = new Person("X"); } — does the caller see the reassignment?', options: [{ t: 'Yes — references are updated everywhere', c: false }, { t: 'No — only the local copy of the reference is changed', c: true }, { t: 'Compile error', c: false }, { t: 'Only on objects of the same class', c: false }] },
      { q: 'How can a method "return" multiple values via parameters?', options: [{ t: 'By passing in a mutable container (array, list, custom holder) and mutating it', c: true }, { t: 'Use the `out` keyword', c: false }, { t: 'Use pointers', c: false }, { t: 'It is impossible', c: false }] },
      { q: 'Why is `void swap(int a, int b)` impossible to write effectively in Java?', options: [{ t: 'Because primitives are passed by value — local copies cannot affect caller', c: true }, { t: 'Because Java forbids reassignment', c: false }, { t: 'Because of generics', c: false }, { t: 'Because the JVM disallows it', c: false }] },
      { q: 'Strings act "as if" pass-by-value because:', options: [{ t: 'They are immutable — a method cannot mutate the original String', c: true }, { t: 'Java treats them specially', c: false }, { t: 'They are primitives', c: false }, { t: 'They are passed via JNI', c: false }] },
      { q: 'Calling list.clear() inside a method reflects in the caller because:', options: [{ t: 'List is a primitive', c: false }, { t: 'Both refs point to the same underlying List object', c: true }, { t: 'Java auto-syncs collections', c: false }, { t: 'It does NOT reflect — that is a misconception', c: false }] },
      { q: 'The phrase "Java is pass-by-reference" is:', options: [{ t: 'Correct only for objects', c: false }, { t: 'Incorrect — it is always pass-by-value, but the value can be a reference', c: true }, { t: 'Correct only for collections', c: false }, { t: 'Correct after Java 8', c: false }] },
      { q: 'Inside a method, `array[0] = 9;` on an array parameter — does the caller see the change?', options: [{ t: 'Yes — same array object', c: true }, { t: 'No — array is copied', c: false }, { t: 'Only for primitive arrays', c: false }, { t: 'Throws an exception', c: false }] },
      { q: 'Inside a method, `array = new int[]{9};` on an array parameter — does the caller see the change?', options: [{ t: 'Yes', c: false }, { t: 'No — only the local reference is reassigned', c: true }, { t: 'Compile error', c: false }, { t: 'Caller sees a null', c: false }] },
      { q: 'Why does this confuse beginners coming from C++?', options: [{ t: 'Because Java has no & or pointer syntax — references are implicit', c: true }, { t: 'Because Java has explicit pointers', c: false }, { t: 'Because Java forbids object parameters', c: false }, { t: 'Because Java uses pass-by-name', c: false }] }
    ],
    code: {
      title: 'Demonstrate Pass-by-Value',
      desc: 'Write three methods showing: (1) primitive change does NOT propagate, (2) object mutation DOES propagate, (3) reassignment of parameter does NOT propagate.',
      starter: "class Box { int n; Box(int n) { this.n = n; } }\n\npublic class Main {\n  static void changePrim(int x) { x = 99; }\n  static void mutateBox(Box b) { /* TODO mutate */ }\n  static void reassignBox(Box b) { /* TODO reassign */ }\n\n  public static void main(String[] args) {\n    int p = 5;\n    Box bx = new Box(5);\n    changePrim(p); System.out.println(p);     // expected 5\n    mutateBox(bx); System.out.println(bx.n);  // expected 99\n    reassignBox(bx); System.out.println(bx.n);// expected 99 (reassignment does not propagate)\n  }\n}",
      expected: '5\n99\n99\n'
    }
  },
  {
    topicTitle: 'String Pool, intern, and == vs .equals()',
    desc: 'String literals share memory in the String pool. Why `"a" == "a"` is true but `new String("a") == new String("a")` is false.',
    detailedExplanation: "Java keeps a special memory area called the **String Pool** (also called String Constant Pool). String LITERALS are placed there and reused.\n\n- `String a = \"hi\"; String b = \"hi\";` — both reference the SAME pool object → `a == b` is true.\n- `String c = new String(\"hi\");` — explicitly creates a new object on the heap → `a == c` is false.\n- `c.intern()` returns the pooled instance — `a == c.intern()` is true.\n\n**Rule of thumb:** ALWAYS use `.equals()` for content comparison. Use `==` only for null checks or intentional reference equality.",
    commonConfusions: "Many beginners write `if (s == \"hello\")` and it works in tests because of pool sharing — then breaks in production where the string came from `new String(...)` or user input. Always use `.equals()`.",
    mcqs: [
      { q: 'String a = "hi"; String b = "hi"; — what is a == b?', options: [{ t: 'true (both refer to the pooled "hi")', c: true }, { t: 'false', c: false }, { t: 'NullPointerException', c: false }, { t: 'Depends on JVM', c: false }] },
      { q: 'String c = new String("hi"); String a = "hi"; — c == a is:', options: [{ t: 'true', c: false }, { t: 'false (new String creates a heap object outside the pool)', c: true }, { t: 'Compile error', c: false }, { t: 'Always true after Java 9', c: false }] },
      { q: 'How do you correctly compare two strings for content equality?', options: [{ t: 'Using ==', c: false }, { t: 'Using .equals()', c: true }, { t: 'Using compareTo() == 0 only', c: false }, { t: 'Using ===', c: false }] },
      { q: 'What does s.intern() return?', options: [{ t: 'A pooled String reference equal in content to s', c: true }, { t: 'A new String each time', c: false }, { t: 'null', c: false }, { t: 'A char array', c: false }] },
      { q: 'String s = "x" + "y"; — where does "xy" live?', options: [{ t: 'In the heap (new object)', c: false }, { t: 'In the String pool — compile-time concatenation of literals is interned', c: true }, { t: 'On the stack', c: false }, { t: 'Outside the JVM', c: false }] },
      { q: 'Result of "abc".equalsIgnoreCase("ABC")?', options: [{ t: 'true', c: true }, { t: 'false', c: false }, { t: 'Compile error', c: false }, { t: 'Depends on locale', c: false }] },
      { q: 'For case-insensitive comparison while avoiding NPE on a possibly-null variable s, prefer:', options: [{ t: 's.equalsIgnoreCase("HI")', c: false }, { t: '"HI".equalsIgnoreCase(s)', c: true }, { t: 's == "HI"', c: false }, { t: 'Both are equally safe', c: false }] },
      { q: 'String b = a + "!"; — how many extra String objects are typically created?', options: [{ t: '1 (the new concatenated String)', c: true }, { t: '0', c: false }, { t: '5+', c: false }, { t: 'Depends on JIT only', c: false }] },
      { q: 'For repeatedly building a String inside a loop, prefer:', options: [{ t: 'Plain `+=` concatenation', c: false }, { t: 'StringBuilder', c: true }, { t: 'StringBuffer always', c: false }, { t: 'String.format every time', c: false }] },
      { q: 'StringBuffer vs StringBuilder differ primarily in:', options: [{ t: 'API', c: false }, { t: 'StringBuffer is synchronized (thread-safe), StringBuilder is not', c: true }, { t: 'Memory layout', c: false }, { t: 'Default size', c: false }] },
      { q: 'Why is `if (s != null && s.equals("yes"))` the safe form?', options: [{ t: 'Short-circuits when s is null — avoiding NPE on the equals call', c: true }, { t: 'It is faster', c: false }, { t: 'It works in all languages', c: false }, { t: 'It does not — NPE is still thrown', c: false }] },
      { q: 'Are String literals shared across classes loaded by the same classloader?', options: [{ t: 'No — each class has its own pool', c: false }, { t: 'Yes — the String pool is JVM-wide for a classloader', c: true }, { t: 'Only at runtime', c: false }, { t: 'Only with -XX:+PoolStrings', c: false }] }
    ],
    code: {
      title: 'String Equality Drill',
      desc: 'Print true/false comparisons for the four scenarios shown in the starter.',
      starter: "public class Main {\n  public static void main(String[] args) {\n    String a = \"hi\";\n    String b = \"hi\";\n    String c = new String(\"hi\");\n    System.out.println(a == b);              // expected: true\n    System.out.println(a == c);              // expected: false\n    System.out.println(a.equals(c));         // expected: true\n    System.out.println(a == c.intern());     // expected: true\n  }\n}",
      expected: 'true\nfalse\ntrue\ntrue\n'
    }
  },
  {
    topicTitle: 'Checked vs Unchecked Exceptions',
    desc: 'Java\'s exception hierarchy: when to catch, when to throw, and when to define your own.',
    detailedExplanation: "Java exceptions split into:\n\n- **Checked exceptions** (extend `Exception` but NOT `RuntimeException`): the compiler forces you to handle them — either with try/catch or by declaring `throws`. Examples: `IOException`, `SQLException`. Used for predictable failure modes (network down, file missing).\n\n- **Unchecked exceptions** (extend `RuntimeException`): the compiler does NOT force you to handle them. Examples: `NullPointerException`, `IllegalArgumentException`, `IndexOutOfBoundsException`. Used for programming bugs.\n\n- **Errors** (extend `Error`): JVM-level catastrophes. Don't catch these. Examples: `OutOfMemoryError`, `StackOverflowError`.\n\n**Custom exceptions:** create checked exceptions for recoverable domain failures, unchecked for invariant violations.",
    commonConfusions: "Wrapping every checked exception in `RuntimeException` to silence the compiler is an anti-pattern — it loses important error type information. Either handle it meaningfully or let it propagate via `throws`.",
    mcqs: [
      { q: 'Which is a CHECKED exception?', options: [{ t: 'NullPointerException', c: false }, { t: 'IOException', c: true }, { t: 'IllegalArgumentException', c: false }, { t: 'ArrayIndexOutOfBoundsException', c: false }] },
      { q: 'Which is an UNCHECKED exception?', options: [{ t: 'IOException', c: false }, { t: 'SQLException', c: false }, { t: 'NullPointerException', c: true }, { t: 'ClassNotFoundException', c: false }] },
      { q: 'When SHOULD you catch Throwable directly?', options: [{ t: 'Always — for safety', c: false }, { t: 'Almost never — Errors (OOM, StackOverflow) should bubble up to the JVM', c: true }, { t: 'In every main method', c: false }, { t: 'When using lambdas', c: false }] },
      { q: 'Which keyword forces a method to declare it might throw a checked exception?', options: [{ t: 'throw', c: false }, { t: 'throws', c: true }, { t: 'catch', c: false }, { t: 'finally', c: false }] },
      { q: 'Difference between `throw` and `throws`?', options: [{ t: '`throw` actually raises an exception; `throws` declares it in a method signature', c: true }, { t: 'They are aliases', c: false }, { t: '`throw` is for runtime, `throws` is for compile-time errors', c: false }, { t: '`throws` raises and `throw` declares', c: false }] },
      { q: 'A `finally` block runs:', options: [{ t: 'Only if the try succeeds', c: false }, { t: 'Always (except when JVM exits or thread dies)', c: true }, { t: 'Only if catch matched', c: false }, { t: 'Never if an exception is thrown', c: false }] },
      { q: 'try-with-resources is preferred for resources because:', options: [{ t: 'It auto-closes any AutoCloseable, even on exception', c: true }, { t: 'It is shorter to type', c: false }, { t: 'It avoids checked exceptions', c: false }, { t: 'It runs faster', c: false }] },
      { q: 'Which is the correct hierarchy?', options: [{ t: 'Throwable → Error / Exception → RuntimeException', c: true }, { t: 'Object → Exception → Error', c: false }, { t: 'Throwable is a primitive', c: false }, { t: 'Error extends RuntimeException', c: false }] },
      { q: 'Multi-catch: `catch (IOException | SQLException e)` was added in:', options: [{ t: 'Java 5', c: false }, { t: 'Java 7', c: true }, { t: 'Java 11', c: false }, { t: 'Java 17', c: false }] },
      { q: 'Wrapping every IOException in RuntimeException to silence the compiler is:', options: [{ t: 'Best practice', c: false }, { t: 'An anti-pattern that hides recoverable failure modes', c: true }, { t: 'Required by JVM', c: false }, { t: 'Standard in Java 17', c: false }] },
      { q: 'A custom exception for a domain rule violation should typically extend:', options: [{ t: 'Throwable', c: false }, { t: 'Exception (checked) for recoverable, RuntimeException for invariant violations', c: true }, { t: 'Always Error', c: false }, { t: 'Object', c: false }] },
      { q: 'Order of catch blocks: which is correct?', options: [{ t: 'Most-specific first (subclass), then more-general (superclass)', c: true }, { t: 'Most-general first', c: false }, { t: 'Order does not matter', c: false }, { t: 'Alphabetical', c: false }] }
    ],
    code: {
      title: 'Custom Checked Exception',
      desc: 'Define `InsufficientBalanceException` (checked) and throw it from a `withdraw(int amount)` method when amount > balance. Catch and print message in main.',
      starter: "class InsufficientBalanceException extends Exception {\n  public InsufficientBalanceException(String msg) { super(msg); }\n}\n\nclass Account {\n  int balance = 100;\n  void withdraw(int amount) throws InsufficientBalanceException {\n    // TODO: throw if amount > balance, else subtract\n  }\n}\n\npublic class Main {\n  public static void main(String[] args) {\n    Account a = new Account();\n    try {\n      a.withdraw(150);\n    } catch (InsufficientBalanceException e) {\n      System.out.println(e.getMessage()); // expected: \"Tried 150, balance only 100\"\n    }\n  }\n}",
      expected: 'Tried 150, balance only 100\n'
    }
  },
  {
    topicTitle: 'Iterator Patterns: Fail-Fast vs Fail-Safe',
    desc: "What `ConcurrentModificationException` actually means and which collections avoid it.",
    detailedExplanation: "**Fail-fast iterators** detect structural modifications (add/remove) during iteration and throw `ConcurrentModificationException` immediately. They check a `modCount` field on each `next()` call. Examples: `ArrayList`, `HashMap`, `HashSet`. The exception isn't a guarantee — it's a best-effort early-warning system.\n\n**Fail-safe iterators** operate on a snapshot of the collection, so they NEVER throw CME but may not reflect concurrent modifications. Examples: `CopyOnWriteArrayList`, `ConcurrentHashMap`. They cost more memory (snapshot) and have weak consistency.\n\n**Correct way to remove during iteration:** use the iterator's own `iterator.remove()` method, OR use `removeIf(predicate)` (Java 8+). Never call `list.remove()` from inside a for-each.",
    commonConfusions: "for-each is just sugar for an Iterator. `for (X x : list) { list.remove(x); }` will throw CME on the second iteration. Use `Iterator<X> it = list.iterator(); while (it.hasNext()) { ...; it.remove(); }` or `list.removeIf(...)`.",
    mcqs: [
      { q: 'You see ConcurrentModificationException. Most likely cause:', options: [{ t: 'Two threads accessing the collection', c: false }, { t: 'Modifying the collection while iterating with a fail-fast iterator', c: true }, { t: 'The collection ran out of memory', c: false }, { t: 'Wrong generic type', c: false }] },
      { q: 'Which collection is fail-SAFE during iteration?', options: [{ t: 'ArrayList', c: false }, { t: 'HashMap', c: false }, { t: 'CopyOnWriteArrayList', c: true }, { t: 'LinkedList', c: false }] },
      { q: 'Correct way to remove elements while iterating an ArrayList:', options: [{ t: 'list.remove(x) inside a for-each', c: false }, { t: 'iterator.remove() or list.removeIf(predicate)', c: true }, { t: 'Synchronize the loop', c: false }, { t: 'Convert to LinkedList first', c: false }] },
      { q: 'Fail-fast iterators detect modifications via:', options: [{ t: 'A modCount counter compared on each next()', c: true }, { t: 'A locked sentinel', c: false }, { t: 'A separate watcher thread', c: false }, { t: 'JVM hooks', c: false }] },
      { q: 'Fail-fast iterator throwing CME is a guarantee?', options: [{ t: 'Yes — guaranteed timing', c: false }, { t: 'No — best-effort early-warning, not a hard guarantee', c: true }, { t: 'Only on Hashtable', c: false }, { t: 'Only after Java 9', c: false }] },
      { q: 'Fail-safe iterators iterate over:', options: [{ t: 'A snapshot / weakly-consistent view', c: true }, { t: 'The live, mutating collection', c: false }, { t: 'A linked clone', c: false }, { t: 'A blocking queue', c: false }] },
      { q: 'CopyOnWriteArrayList is most appropriate when:', options: [{ t: 'Many reads, few writes', c: true }, { t: 'Many writes, few reads', c: false }, { t: 'Single-threaded', c: false }, { t: 'When ordering does not matter', c: false }] },
      { q: 'Which collection class\'s iterator does NOT throw CME?', options: [{ t: 'ArrayList', c: false }, { t: 'ConcurrentHashMap', c: true }, { t: 'HashMap', c: false }, { t: 'TreeMap', c: false }] },
      { q: 'for-each loop is essentially:', options: [{ t: 'Sugar for an iterator-based while loop', c: true }, { t: 'A separate language construct unrelated to Iterator', c: false }, { t: 'Always faster than Iterator', c: false }, { t: 'Limited to arrays', c: false }] },
      { q: 'Iterator.remove() removes which element?', options: [{ t: 'The next element', c: false }, { t: 'The element most recently returned by next()', c: true }, { t: 'The first element', c: false }, { t: 'A random element', c: false }] },
      { q: 'list.removeIf(predicate) was added in:', options: [{ t: 'Java 5', c: false }, { t: 'Java 8 (uses Predicate functional interface)', c: true }, { t: 'Java 11', c: false }, { t: 'Java 17', c: false }] },
      { q: 'Which is NOT a way to safely remove during iteration of an ArrayList?', options: [{ t: 'Iterator.remove()', c: false }, { t: 'list.removeIf(...)', c: false }, { t: 'list.remove(x) inside for-each', c: true }, { t: 'Build a separate "to-remove" list and call list.removeAll(...)', c: false }] }
    ],
    code: {
      title: 'Safe Element Removal',
      desc: 'Remove all even numbers from a list while iterating, without triggering ConcurrentModificationException.',
      starter: "import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));\n    // TODO: remove all even numbers safely\n    System.out.println(nums); // expected: [1, 3, 5]\n  }\n}",
      expected: '[1, 3, 5]\n'
    }
  },
  {
    topicTitle: 'Concurrent Collections',
    desc: 'Why HashMap breaks under concurrency, and how ConcurrentHashMap fixes it.',
    detailedExplanation: "Standard `HashMap` is NOT thread-safe. Concurrent puts can corrupt the internal bucket array — in Java 7 this could even cause infinite loops on get().\n\n**Three options for thread-safe maps:**\n\n1. **`Hashtable`** (legacy) — every method is synchronized on the whole table. Thread-safe but every operation locks the entire structure. Slow under contention. Don't use in new code.\n\n2. **`Collections.synchronizedMap(new HashMap<>())`** — wraps a HashMap with synchronized delegates. Same coarse-grained locking as Hashtable. Still requires manual sync for compound operations like check-then-put.\n\n3. **`ConcurrentHashMap`** — designed for concurrency. Internally splits into segments/bins; reads are mostly lock-free; writes lock only the affected bin. Provides atomic operations: `putIfAbsent`, `compute`, `merge`. Use this in new multi-threaded code.\n\n**Null handling:** ConcurrentHashMap disallows null keys/values; HashMap allows them.",
    commonConfusions: "`Collections.synchronizedMap` is NOT the same as `ConcurrentHashMap`. The former locks the entire map per operation. The latter is finely-locked and far more performant — and provides atomic compound operations the synchronized wrapper does not.",
    mcqs: [
      { q: 'Which Map is best for high-concurrency scenarios?', options: [{ t: 'HashMap', c: false }, { t: 'Hashtable', c: false }, { t: 'ConcurrentHashMap', c: true }, { t: 'TreeMap', c: false }] },
      { q: 'Can you put null keys/values in ConcurrentHashMap?', options: [{ t: 'Yes, both', c: false }, { t: 'No — neither is allowed', c: true }, { t: 'Only null values', c: false }, { t: 'Only null keys', c: false }] },
      { q: 'Why is plain HashMap unsafe under multi-threaded writes?', options: [{ t: 'It uses too much memory', c: false }, { t: 'Concurrent puts can corrupt internal bucket structure', c: true }, { t: 'Iterators are slow', c: false }, { t: 'It throws CME on every put', c: false }] },
      { q: 'Hashtable is thread-safe via:', options: [{ t: 'Coarse-grained synchronization on every method', c: true }, { t: 'Lock-free atomics', c: false }, { t: 'Striped locks per bucket', c: false }, { t: 'Copy-on-write snapshots', c: false }] },
      { q: 'Collections.synchronizedMap(map) provides thread safety by:', options: [{ t: 'Wrapping every method in a synchronized block on a single mutex', c: true }, { t: 'Striped locks', c: false }, { t: 'Copy-on-write', c: false }, { t: 'Lock-free CAS', c: false }] },
      { q: 'For check-then-put atomicity, prefer:', options: [{ t: 'map.putIfAbsent(k, v) or map.computeIfAbsent(...)', c: true }, { t: 'Two separate get/put calls', c: false }, { t: 'Hashtable', c: false }, { t: 'WeakHashMap', c: false }] },
      { q: 'ConcurrentHashMap.compute(key, fn) is:', options: [{ t: 'Atomic for that bucket — fn runs while the bucket is locked', c: true }, { t: 'Asynchronous', c: false }, { t: 'Best-effort, may run twice', c: false }, { t: 'Identical to get + put', c: false }] },
      { q: 'CopyOnWriteArrayList is a poor choice when:', options: [{ t: 'You have read-heavy workloads', c: false }, { t: 'You have write-heavy workloads — every write copies the array', c: true }, { t: 'You need ordering', c: false }, { t: 'You need iteration', c: false }] },
      { q: 'BlockingQueue is typically used for:', options: [{ t: 'Producer-consumer hand-off between threads', c: true }, { t: 'Sorting elements', c: false }, { t: 'Map-style key-value storage', c: false }, { t: 'GUI event loops', c: false }] },
      { q: 'AtomicInteger.incrementAndGet() is preferable to volatile + ++ because:', options: [{ t: 'Read-modify-write needs atomicity, which volatile alone does not provide', c: true }, { t: 'It is faster', c: false }, { t: 'It uses synchronized internally', c: false }, { t: 'It guarantees ordering', c: false }] },
      { q: 'When iterating a ConcurrentHashMap, the iterator:', options: [{ t: 'Is weakly-consistent — may or may not reflect concurrent updates', c: true }, { t: 'Throws ConcurrentModificationException', c: false }, { t: 'Locks the whole map', c: false }, { t: 'Is fail-fast', c: false }] },
      { q: 'For atomic per-key counters across threads, use:', options: [{ t: 'ConcurrentHashMap.merge(key, 1, Integer::sum)', c: true }, { t: 'A synchronized HashMap', c: false }, { t: 'Plain HashMap with `volatile`', c: false }, { t: 'Hashtable.put()', c: false }] }
    ],
    code: {
      title: 'Atomic Counter with ConcurrentHashMap',
      desc: 'Use ConcurrentHashMap.merge() to atomically increment a per-key counter from 4 threads.',
      starter: "import java.util.concurrent.*;\nimport java.util.*;\n\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();\n    Runnable task = () -> {\n      for (int i = 0; i < 1000; i++) {\n        // TODO: atomically increment counts.get(\"hits\")\n      }\n    };\n    Thread[] ts = new Thread[4];\n    for (int i = 0; i < 4; i++) { ts[i] = new Thread(task); ts[i].start(); }\n    for (Thread t : ts) t.join();\n    System.out.println(counts.get(\"hits\")); // expected: 4000\n  }\n}",
      expected: '4000\n'
    }
  },
  {
    topicTitle: 'Day 50 Mock Round — Java Interview Finale',
    desc: 'A mixed mock interview round combining the placement-Java concepts from days 41–49.',
    detailedExplanation: "**Congratulations — you've reached Day 50.**\n\nThis day is a mock interview round combining everything you've practiced over the last 10 days: equals/hashCode, immutability, Singleton, Comparable/Comparator, pass-by-value, String pool, exceptions, iterators, and concurrent collections.\n\nUse this day to:\n1. Take the 5 mixed MCQs below — these are real Java interview questions.\n2. Solve the coding problem under timed conditions (15 min target).\n3. Then take a full company mock from /assessments.\n\nIf you struggle with any topic, go back to that specific day and re-read it. Repetition is the unlock.",
    commonConfusions: "Day 50 is a milestone, not the finish line. Java interviews compound — concepts from day 41 will be tested alongside concepts from day 49. Mixed practice (which is what real interviews do) is harder than topic-isolated practice. That's why we end on a mock round.",
    mcqs: [
      { q: 'In which collection should you AVOID using a mutable object as a key?', options: [{ t: 'ArrayList', c: false }, { t: 'HashMap (mutating a key after insert breaks lookup)', c: true }, { t: 'TreeMap (it sorts, so mutation is fine)', c: false }, { t: 'LinkedList', c: false }] },
      { q: 'String s1 = "x" + "y"; String s2 = "xy"; — s1 == s2 is:', options: [{ t: 'true — compile-time concatenation interns both in the pool', c: true }, { t: 'false', c: false }, { t: 'Compile error', c: false }, { t: 'Depends on JVM', c: false }] },
      { q: 'You override equals() but break the contract: a.equals(b) is true but b.equals(a) is false. This violates:', options: [{ t: 'Reflexivity', c: false }, { t: 'Symmetry', c: true }, { t: 'Transitivity', c: false }, { t: 'Consistency', c: false }] },
      { q: 'Which Singleton variant is reflection-safe AND serialization-safe by default?', options: [{ t: 'Eager init', c: false }, { t: 'Synchronized lazy', c: false }, { t: 'Double-checked locking', c: false }, { t: 'Enum singleton', c: true }] },
      { q: 'A method declared `throws IOException` is called WITHOUT try-catch. The caller method:', options: [{ t: 'Has a compile error', c: false }, { t: 'Must also declare `throws IOException` — or wrap it in try/catch', c: true }, { t: 'Runs fine — IOException is unchecked', c: false }, { t: 'Auto-wraps in RuntimeException', c: false }] },
      { q: 'Java passes a Person object reference to a method that does `p = new Person("X")`. After the call, the caller\'s reference is:', options: [{ t: 'Unchanged (reassignment of the local copy does not propagate)', c: true }, { t: 'Now pointing to "X"', c: false }, { t: 'null', c: false }, { t: 'Compile error', c: false }] },
      { q: 'For two equal objects in a HashMap, what MUST hold for lookups to work?', options: [{ t: 'They must have the same hashCode AND be equals()-equal', c: true }, { t: 'Same toString', c: false }, { t: 'Same class object', c: false }, { t: 'Same memory address', c: false }] },
      { q: 'A subtle bug: implementing only Comparable but not equals() causes issues in:', options: [{ t: 'TreeSet (uses compareTo as equality)', c: true }, { t: 'ArrayList', c: false }, { t: 'HashMap', c: false }, { t: 'LinkedList', c: false }] },
      { q: 'You see CME during a single-threaded for-each + remove. Fix by:', options: [{ t: 'Adding `synchronized`', c: false }, { t: 'Using Iterator.remove() or list.removeIf(...)', c: true }, { t: 'Switching to LinkedList', c: false }, { t: 'Using volatile', c: false }] },
      { q: 'StringBuilder vs `+` concatenation in a tight loop:', options: [{ t: 'Equivalent', c: false }, { t: 'StringBuilder avoids creating many intermediate Strings — faster for many concatenations', c: true }, { t: '`+` is faster for any case', c: false }, { t: 'Both create the same bytecode', c: false }] },
      { q: 'You must compute a hot, thread-safe per-key counter. Use:', options: [{ t: 'HashMap with synchronized blocks', c: false }, { t: 'ConcurrentHashMap.merge(key, 1, Integer::sum)', c: true }, { t: 'Hashtable.put', c: false }, { t: 'WeakHashMap', c: false }] },
      { q: 'For an immutable value object that will be a HashMap key, the safest design is:', options: [{ t: 'Final class, final fields, equals/hashCode based ONLY on those final fields', c: true }, { t: 'Public fields only', c: false }, { t: 'Static fields and getters', c: false }, { t: 'Marker interface only', c: false }] }
    ],
    code: {
      title: 'Final Coding Challenge: Word Frequency',
      desc: "Read a sentence and print the word that appears most frequently. Tie? Print the lexicographically smallest. Ignore case. Use HashMap + Comparator.",
      starter: "import java.util.*;\n\npublic class Main {\n  public static String mostFrequent(String sentence) {\n    // TODO: split, count via HashMap, find best entry\n    return \"\";\n  }\n\n  public static void main(String[] args) {\n    System.out.println(mostFrequent(\"the cat sat on the mat\")); // expected: \"the\"\n    System.out.println(mostFrequent(\"a b c a b c\"));            // expected: \"a\" (tie → smallest)\n  }\n}",
      expected: 'the\na\n'
    }
  }
];

// Cross-link map: dayNumber → DSA problem slugs that match the day's topic.
// Days not listed get no DSA pills.
const dsaCrossLinks = {
  5: ['arrays-sum', 'arrays-max-element'], // Loops day → simple array iteration
  6: ['arrays-sum', 'arrays-max-element', 'arrays-reverse', 'arrays-second-largest', 'arrays-rotate', 'arrays-move-zeroes', 'arrays-subarray-max-sum', 'arrays-two-sum'], // Arrays day
  41: ['hashing-intersection', 'hashing-group-anagrams'], // equals/hashCode
  44: ['arrays-second-largest'], // Comparable/Comparator
  46: ['strings-palindrome', 'strings-anagram', 'strings-first-unique', 'strings-reverse-words'], // String pool day → string problems
  48: ['ll-reverse', 'll-detect-cycle', 'll-merge-sorted', 'll-remove-nth'], // Iterator patterns → LL traversal
  49: ['hashing-subarray-sum-k', 'hashing-longest-consecutive'], // Concurrent collections → hashing problems
  50: ['stack-valid-parentheses', 'stack-min-stack', 'recursion-fibonacci', 'tree-inorder-traversal'] // Mixed finale
};

for (let i = 1; i <= 50; i++) {
  let dayData;

  if (i <= 10) {
    dayData = realJavaRoadmap[i - 1];
  } else if (i >= 41) {
    // Days 41-50: hand-crafted placement-Java content
    dayData = placementJavaDays[i - 41];
  } else {
    // Days 11-40: intermediate fallback content
    dayData = {
      topicTitle: fallbackTopics[(i - 11) % fallbackTopics.length] + ` (Day ${i})`,
      desc: `Deep dive into advanced Java concepts. Master this topic to become a Senior Java Developer!`,
      detailedExplanation: `In this advanced lesson, we will explore the core concepts of ${fallbackTopics[(i - 11) % fallbackTopics.length]}. Ensure you have completely mastered the previous days before proceeding.\n\nTake your time with the interactive modules below.`,
      commonConfusions: `Advanced topics can be tricky! The best way to overcome this block is to write the code yourself in the editor below and experiment with different inputs.`,
      mcqs: Array.from({ length: 3 }).map((_, idx) => ({
        q: `Advanced MCQ ${idx + 1} for Day ${i}?`,
        options: [
          { text: `Correct Option`, isCorrect: true },
          { text: `Wrong A`, isCorrect: false },
          { text: `Wrong B`, isCorrect: false }
        ]
      })),
      code: {
        title: `Challenge ${i}`,
        desc: `Write a program returning true.`,
        starter: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("true");\n  }\n}`,
        expected: "true\n"
      }
    };
  }

  const formattedMcqs = dayData.mcqs.map(m => ({
    question: m.q,
    options: m.options.map(o => ({
      text: o.t !== undefined ? o.t : o.text,
      isCorrect: o.c !== undefined ? o.c : o.isCorrect
    }))
  }));

  days.push({
    dayNumber: i,
    topicTitle: dayData.topicTitle,
    description: dayData.desc,
    detailedExplanation: dayData.detailedExplanation,
    commonConfusions: dayData.commonConfusions,
    videoUrl: 'https://www.youtube.com/embed/eIrMbAQSU34',
    mcqs: formattedMcqs,
    predictOutput: dayData.predict || [
      {
        codeSnippet: `public class Test {\n  public static void main(String[] args) {\n    System.out.println("Day ${i} Module");\n  }\n}`,
        expectedOutput: `Day ${i} Module`,
        explanation: `Prints the simple string representation of Day ${i}.`
      }
    ],
    codingProblem: {
      title: dayData.code.title,
      description: dayData.code.desc,
      starterCode: dayData.code.starter,
      expectedOutput: dayData.code.expected
    },
    refactorProblem: dayData.refactor || {
      title: `Refactor Challenge ${i}`,
      description: `The following code works, but violates clean code principles. Refactor it to improve readability and structure.`,
      messyCode: `public class BadCode {\n  public void doStuff(int x, int y) {\n    if(x > 0){\n      if(y > 0){\n        System.out.println(\"Positive\");\n      }\n    }\n  }\n}`
    },
    dsaSlugs: dsaCrossLinks[i] || []
  });
}

const importData = async () => {
  try {
    // Clear out specific collections or all. For safety, we keep users untouched in this run
    // but we can clear them if we want a full reset.
    await DayContent.deleteMany();
    await Comment.deleteMany();
    await MockTest.deleteMany();
    await TestResult.deleteMany();

    console.log('Cleared existing curriculum and assessment data.');

    // Inject a Mock Test (Phase 16)
    const tcsMock = new MockTest({
      companyName: 'TCS',
      title: 'TCS NQT Ninja Preparation Mock',
      description: 'A 60-minute rigorous mock assessment encompassing logical reasoning, quantitative aptitude, and Java programming fundamentals designed to mirror the actual TCS National Qualifier Test.',
      durationMinutes: 60,
      difficulty: 'Medium',
      isActive: true,
      mcqs: [
        {
          question: 'What is the output of the following Java code?\n`int x = 5; System.out.println(x++ + ++x);`',
          options: ['10', '11', '12', '13'],
          correctAnswer: 2, // 5 + 7 = 12
          explanation: 'x is 5. x++ evaluates to 5, then x becomes 6. ++x evaluates to 7, and x becomes 7. 5 + 7 = 12.'
        },
        {
          question: 'Which of the following sorting algorithms has the best worst-case time complexity?',
          options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Selection Sort'],
          correctAnswer: 1,
          explanation: 'Merge sort has a strict O(N log N) worst-case time complexity.'
        },
        {
          question: 'A train 125 m long passes a man, running at 5 km/hr in the same direction in which the train is going, in 10 seconds. The speed of the train is:',
          options: ['45 km/hr', '50 km/hr', '54 km/hr', '55 km/hr'],
          correctAnswer: 1,
          explanation: 'Speed of train relative to man = (125/10) m/sec = (25/2) m/sec = 45 km/hr. Speed of train = 45 + 5 = 50 km/hr.'
        }
      ],
      codingProblems: [
        {
          title: 'Reverse words in a given string',
          description: 'Given a String S, reverse the string without reversing its individual words. Words are separated by dots.',
          initialCode: 'class Solution {\\n    String reverseWords(String S) {\\n        // code here\\n    }\\n}',
          expectedOutput: 'much.very.program.this.like.i'
        }
      ]
    });

    await tcsMock.save();
    console.log('Inserted TCS NQT Mock Test');

    await DayContent.insertMany(days);
    console.log('50 Days of Java Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

importData();
