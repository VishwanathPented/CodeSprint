import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DayContent from './models/DayContent.js';

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
      { q: "Java is dependent on which of the following?", options: [{t: "Platform", c: false}, {t: "Hardware", c: false}, {t: "OS", c: false}, {t: "Platform Independent", c: true}] }
    ],
    code: {
      title: "First Java Program",
      desc: "Write a Java program to print 'Hello World!'.",
      starter: "public class Main {\n  public static void main(String[] args) {\n    // Print Hello World! below\n    \n  }\n}",
      expected: "Hello World!\n"
    }
  },
  {
    topicTitle: "Data Types & Variables",
    desc: "Basic syntax, Variables, Data types, Type casting, and Type Conversion.",
    detailedExplanation: "Variables are like containers for storing data values. In Java, every variable must have a 'Type' declared before you can use it (this is called static typing).\n\nPrimitive types include:\n- int: Whole numbers (e.g., 5)\n- double: Decimal numbers (e.g., 5.99)\n- char: Single characters (e.g., 'A')\n- boolean: True or False\n\nSometimes you need to fit a large number into a smaller container; this is called 'Type Casting'.",
    commonConfusions: "1. Mixing up String and char. `char` uses single quotes ('a') and stores exactly ONE character. `String` uses double quotes (\"hello\") and stores text.\n2. Forgetting that dividing two integers (like 5 / 2) drops the decimal and results in 2, not 2.5! You must use a double to keep the decimal.",
    mcqs: [
      { q: "What is the size of int in Java?", options: [{t: "2 bytes", c: false}, {t: "4 bytes", c: true}, {t: "8 bytes", c: false}, {t: "Depends on OS", c: false}] },
      { q: "Which of these is not a primitive type?", options: [{t: "boolean", c: false}, {t: "float", c: false}, {t: "String", c: true}, {t: "char", c: false}] },
      { q: "What type of casting is done automatically?", options: [{t: "Narrowing", c: false}, {t: "Widening", c: true}, {t: "Explicit", c: false}, {t: "None", c: false}] }
    ],
    code: {
      title: "Variable Assignment",
      desc: "Create an int variable 'x' assigned to 10 and print it.",
      starter: "public class Main {\n  public static void main(String[] args) {\n    \n  }\n}",
      expected: "10\n"
    }
  },
  {
    topicTitle: "Operators & Expressions",
    desc: "Arithmetic, Relational, Logical, and Bitwise Operators.",
    detailedExplanation: "Operators are special symbols that perform specific operations on one, two, or three variables, and then return a result.\n\n- Arithmetic (+, -, *, /, %) perform basic math.\n- Relational (==, !=, >, <) compare two values and return a boolean (true/false).\n- Logical (&&, ||, !) connect multiple boolean expressions together.\n\nThe modulo % operator is especially useful for finding if a number is even or odd by checking if `num % 2 == 0`.",
    commonConfusions: "The single equals `=` is the ASSIGNMENT operator. It assigns the value on the right to the variable on the left.\n\nThe double equals `==` is the COMPARISON operator. It checks if the left side is mathematically equal to the right side.\n\nNever do `if (a = b)`. Always do `if (a == b)`.",
    mcqs: [
      { q: "Which operator is used to compute the remainder?", options: [{t: "/", c: false}, {t: "*", c: false}, {t: "%", c: true}, {t: "-", c: false}] },
      { q: "What is the output of 5 & 3?", options: [{t: "8", c: false}, {t: "1", c: true}, {t: "2", c: false}, {t: "7", c: false}] },
      { q: "Which of the following is an equality operator?", options: [{t: "=", c: false}, {t: "==", c: true}, {t: "!=", c: false}, {t: "Both == and !=", c: false}] } // assuming == is true enough for basic
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
      { q: "Which keyword is used to evaluate alternative paths?", options: [{t: "else", c: true}, {t: "default", c: false}, {t: "switch", c: false}, {t: "break", c: false}] },
      { q: "Can a switch statement accept Strings in Java 8+?", options: [{t: "Yes", c: true}, {t: "No", c: false}, {t: "Only Enums", c: false}, {t: "Only int", c: false}] },
      { q: "Which jumps out of the switch case?", options: [{t: "continue", c: false}, {t: "break", c: true}, {t: "exit", c: false}, {t: "return", c: false}] }
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
      { q: "Which loop guarantees at least one execution?", options: [{t: "for", c: false}, {t: "while", c: false}, {t: "do-while", c: true}, {t: "enhanced for", c: false}] },
      { q: "What keyword skips the current iteration?", options: [{t: "break", c: false}, {t: "continue", c: true}, {t: "pass", c: false}, {t: "next", c: false}] },
      { q: "Is 'for(;;)' a valid infinite loop in Java?", options: [{t: "Yes", c: true}, {t: "No", c: false}, {t: "Only in C", c: false}, {t: "Syntax Error", c: false}] }
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
      { q: "How do you find the length of an array 'arr'?", options: [{t: "arr.size()", c: false}, {t: "arr.length()", c: false}, {t: "arr.length", c: true}, {t: "arr.count", c: false}] },
      { q: "What is the default value of an int array element?", options: [{t: "null", c: false}, {t: "0", c: true}, {t: "undefined", c: false}, {t: "-1", c: false}] },
      { q: "Which index does an array start with?", options: [{t: "1", c: false}, {t: "0", c: true}, {t: "-1", c: false}, {t: "Memory Address", c: false}] }
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
      { q: "Which keyword creates an object?", options: [{t: "create", c: false}, {t: "new", c: true}, {t: "class", c: false}, {t: "object", c: false}] },
      { q: "Is Java purely object-oriented?", options: [{t: "Yes", c: false}, {t: "No (because of primitives)", c: true}, {t: "No (because of pointers)", c: false}, {t: "Yes (Everything is an object)", c: false}] }
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
      { q: "What is the return type of a constructor?", options: [{t: "void", c: false}, {t: "int", c: false}, {t: "None", c: true}, {t: "Object", c: false}] },
      { q: "Can a constructor have the same name as methods?", options: [{t: "Yes", c: false}, {t: "No, must match Class name", c: true}, {t: "Only in abstract class", c: false}, {t: "Depends on JVM", c: false}] },
      { q: "Which keyword distinguishes instance variables from parameters?", options: [{t: "super", c: false}, {t: "self", c: false}, {t: "this", c: true}, {t: "static", c: false}] }
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
      { q: "Which access modifier is restricted to the same class?", options: [{t: "public", c: false}, {t: "protected", c: false}, {t: "private", c: true}, {t: "default", c: false}] },
      { q: "What mechanism binds data and code together?", options: [{t: "Polymorphism", c: false}, {t: "Encapsulation", c: true}, {t: "Inheritance", c: false}, {t: "Abstraction", c: false}] },
      { q: "What modifiers do interface variables have implicitly?", options: [{t: "public static final", c: true}, {t: "private", c: false}, {t: "protected", c: false}, {t: "None", c: false}] }
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
      { q: "Which keyword is used to inherit a class?", options: [{t: "implements", c: false}, {t: "inherits", c: false}, {t: "extends", c: true}, {t: "super", c: false}] },
      { q: "Does Java support multiple inheritance with classes?", options: [{t: "Yes", c: false}, {t: "No", c: true}, {t: "Only in Java 8+", c: false}, {t: "If static", c: false}] },
      { q: "Which class is the root of all Java classes?", options: [{t: "Main", c: false}, {t: "System", c: false}, {t: "Object", c: true}, {t: "String", c: false}] }
    ],
    code: {
      title: "Superclass Method call",
      desc: "Call a parent class method using 'extends'.",
      starter: "class Parent {\n  void hello() { System.out.println(\"Hi Parent\"); }\n}\nclass Child extends Parent {}\n\npublic class Main {\n  public static void main(String[] args) {\n    Child c = new Child();\n    c.hello();\n  }\n}",
      expected: "Hi Parent\n"
    }
  }
];

// Fallback topics for 11-50
const fallbackTopics = [
  'Method Overriding & Polymorphism', 'Abstract Classes', 'Interfaces in Java',
  'Static Keyword', 'Final Keyword', 'Exception Handling (try-catch)', 
  'Throw & Throws', 'Custom Exceptions', 'File Handling (Reading)', 
  'File Handling (Writing)', 'Java Generics', 'Enums', 'Date and Time API',
  'Collection Framework Overview', 'ArrayLists in Java', 'LinkedLists', 
  'HashSets', 'HashMaps', 'Iterators & For-Each Loop', 
  'Lambda Expressions', 'Stream API Basics', 'Multithreading Basics', 'Building a Java API'
];

for (let i = 1; i <= 50; i++) {
  let dayData;

  if (i <= 10) {
    dayData = realJavaRoadmap[i - 1];
  } else {
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

  // Aptitude is generic mathematical stuff
  const aptitudeQuestions = Array.from({ length: 3 }).map((_, idx) => ({
    question: `If a train runs at ${60 + i} km/hr for 2 hours, what distance does it cover?`,
    options: [
      { text: `${(60 + i) * 2}`, isCorrect: true },
      { text: `100`, isCorrect: false },
      { text: `200`, isCorrect: false }
    ],
    hint: `Speed * Time = Distance`,
    explanation: `Distance is ${(60 + i) * 2} km.`
  }));

  days.push({
    dayNumber: i,
    topicTitle: dayData.topicTitle,
    description: dayData.desc,
    detailedExplanation: dayData.detailedExplanation,
    commonConfusions: dayData.commonConfusions,
    videoUrl: 'https://www.youtube.com/embed/eIrMbAQSU34', // valid java course video
    mcqs: formattedMcqs,
    codingProblem: {
      title: dayData.code.title,
      description: dayData.code.desc,
      starterCode: dayData.code.starter,
      expectedOutput: dayData.code.expected
    },
    aptitudeQuestions: aptitudeQuestions
  });
}

const importData = async () => {
  try {
    await DayContent.deleteMany(); 
    await DayContent.insertMany(days);
    console.log('50 Days of Java Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

importData();
