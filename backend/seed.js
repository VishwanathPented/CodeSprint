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
      { q: "Java is dependent on which of the following?", options: [{t: "Platform", c: false}, {t: "Hardware", c: false}, {t: "OS", c: false}, {t: "Platform Independent", c: true}] }
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
      { q: "What is the size of int in Java?", options: [{t: "2 bytes", c: false}, {t: "4 bytes", c: true}, {t: "8 bytes", c: false}, {t: "Depends on OS", c: false}] },
      { q: "Which of these is not a primitive type?", options: [{t: "boolean", c: false}, {t: "float", c: false}, {t: "String", c: true}, {t: "char", c: false}] },
      { q: "What type of casting is done automatically?", options: [{t: "Narrowing", c: false}, {t: "Widening", c: true}, {t: "Explicit", c: false}, {t: "None", c: false}] }
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
      { q: 'If you override equals() in a class, what else must you override?', options: [{ t: 'toString()', c: false }, { t: 'hashCode()', c: true }, { t: 'compareTo()', c: false }, { t: 'clone()', c: false }] },
      { q: 'Two objects have the same hashCode. What can you say about them?', options: [{ t: 'They must be equal', c: false }, { t: 'They might be equal — hash collisions are allowed', c: true }, { t: 'They are stored at the same memory address', c: false }, { t: 'It is a bug', c: false }] },
      { q: 'What happens if you override equals() but NOT hashCode()?', options: [{ t: 'Compile error', c: false }, { t: 'Objects misbehave in HashMap/HashSet', c: true }, { t: 'Nothing — they are independent', c: false }, { t: 'JVM auto-generates hashCode()', c: false }] }
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
      { q: 'Which of the following is required to make a class immutable?', options: [{ t: 'Make all methods static', c: false }, { t: 'Make fields private final and provide no setters', c: true }, { t: 'Mark every method synchronized', c: false }, { t: 'Inherit from Immutable interface', c: false }] },
      { q: 'final List<Integer> list = new ArrayList<>(); list.add(5); — what happens?', options: [{ t: 'Compile error', c: false }, { t: 'Runtime exception', c: false }, { t: 'Works fine — final locks reference, not contents', c: true }, { t: 'Throws UnsupportedOperationException', c: false }] },
      { q: 'Why is String immutable in Java?', options: [{ t: 'For thread safety, security (e.g. as Map keys), and string pool optimization', c: true }, { t: 'To save memory only', c: false }, { t: 'It is not — you can modify Strings', c: false }, { t: 'Historical accident', c: false }] }
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
      { q: 'In double-checked locking, what is the role of `volatile`?', options: [{ t: 'Makes the field final', c: false }, { t: 'Prevents instruction reordering and ensures visibility across threads', c: true }, { t: 'Speeds up reads', c: false }, { t: 'Required only for primitives', c: false }] },
      { q: 'A naive non-synchronized lazy Singleton can be broken by:', options: [{ t: 'Reflection only', c: false }, { t: 'Concurrent calls from multiple threads creating multiple instances', c: true }, { t: 'JVM warm-up', c: false }, { t: 'Garbage collection', c: false }] }
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
      { q: 'Why is `return a - b` risky in compareTo?', options: [{ t: 'Slower than Integer.compare', c: false }, { t: 'Subtraction can overflow with extreme values', c: true }, { t: 'Returns wrong sign', c: false }, { t: 'It does not compile', c: false }] }
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
      { q: 'Java argument passing is:', options: [{ t: 'Pass-by-reference for objects', c: false }, { t: 'Pass-by-value, always — but for objects the value is the reference', c: true }, { t: 'Pass-by-name', c: false }, { t: 'Depends on the JVM', c: false }] },
      { q: 'void modify(int n) { n = 99; } — caller passes x = 5. After call, x is:', options: [{ t: '5', c: true }, { t: '99', c: false }, { t: 'undefined', c: false }, { t: 'compile error', c: false }] },
      { q: 'void rename(Person p) { p.name = "X"; } — does the caller see the rename?', options: [{ t: 'Yes — the reference points to the same object', c: true }, { t: 'No — Java is pass-by-value', c: false }, { t: 'Only if Person is final', c: false }, { t: 'Throws an exception', c: false }] }
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
      { q: 'String c = new String("hi"); String a = "hi"; — c == a is:', options: [{ t: 'true', c: false }, { t: 'false (new String creates a heap object outside the pool)', c: true }, { t: 'compile error', c: false }, { t: 'always true after Java 9', c: false }] },
      { q: 'How do you correctly compare two strings for content equality?', options: [{ t: 'Using ==', c: false }, { t: 'Using .equals()', c: true }, { t: 'Using compareTo() == 0 only', c: false }, { t: 'Using === ', c: false }] }
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
      { q: 'When SHOULD you catch a Throwable directly?', options: [{ t: 'Always — for safety', c: false }, { t: 'Never — Errors should bubble up to the JVM', c: true }, { t: 'In every main method', c: false }, { t: 'When using lambdas', c: false }] }
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
      { q: 'Which collection is fail-SAFE for iteration?', options: [{ t: 'ArrayList', c: false }, { t: 'HashMap', c: false }, { t: 'CopyOnWriteArrayList', c: true }, { t: 'LinkedList', c: false }] },
      { q: 'Correct way to remove elements while iterating an ArrayList:', options: [{ t: 'list.remove(x) inside for-each', c: false }, { t: 'iterator.remove() or list.removeIf(predicate)', c: true }, { t: 'Synchronize the loop', c: false }, { t: 'Convert to LinkedList first', c: false }] }
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
      { q: 'Why is HashMap unsafe under multi-thread access?', options: [{ t: 'It uses too much memory', c: false }, { t: 'Concurrent put operations can corrupt internal state', c: true }, { t: 'Iterators are slow', c: false }, { t: 'It throws CME on every put', c: false }] }
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
      { q: 'In which collection should you AVOID using a mutable object as a key?', options: [{ t: 'ArrayList', c: false }, { t: 'HashMap', c: true }, { t: 'TreeMap (it sorts, so mutation is fine)', c: false }, { t: 'LinkedList', c: false }] },
      { q: 'String s1 = "x" + "y"; String s2 = "xy"; — s1 == s2 is:', options: [{ t: 'true (compile-time concatenation puts both in the pool)', c: true }, { t: 'false', c: false }, { t: 'Compile error', c: false }, { t: 'Depends on JVM', c: false }] },
      { q: 'You override equals() but break the contract (a.equals(b) but b.equals(a) is false). What is this called?', options: [{ t: 'Reflexive violation', c: false }, { t: 'Symmetric violation', c: true }, { t: 'Transitive violation', c: false }, { t: 'Consistent violation', c: false }] },
      { q: 'Which Singleton variant is reflection-safe AND serialization-safe?', options: [{ t: 'Eager init', c: false }, { t: 'Synchronized lazy', c: false }, { t: 'Double-checked locking', c: false }, { t: 'Enum singleton', c: true }] },
      { q: 'A method declared `throws IOException` is called without a try-catch. The caller method:', options: [{ t: 'Has compile error', c: false }, { t: 'Must also declare `throws IOException` — or compile error', c: true }, { t: 'Runs fine — IOException is unchecked', c: false }, { t: 'Auto-wraps in RuntimeException', c: false }] }
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
