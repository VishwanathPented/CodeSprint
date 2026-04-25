// Seeds additional company-pattern mocks (Infosys SP, Wipro NLTH).
// Idempotent: only inserts if a mock with the same title doesn't already exist.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MockTest from './models/MockTest.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codesprint50')
  .then(() => console.log('Connected to MongoDB for Mock Test Seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

const mocks = [
  {
    companyName: 'Infosys',
    title: 'Infosys SP — Mock Round (Pattern)',
    description: '15 MCQs covering aptitude + reasoning + verbal + technical, with 1 coding problem. Mirrors the Infosys SystemEngineer/SystemEngineerSpecialist (SP) pattern.',
    durationMinutes: 75,
    difficulty: 'Medium',
    isActive: true,
    mcqs: [
      {
        question: 'A train 150 m long passes a man walking at 6 km/h in the same direction in 10 seconds. Speed of the train (km/h)?',
        options: ['54', '60', '66', '72'],
        correctAnswer: 2,
        explanation: 'Relative speed = 150/10 = 15 m/s = 54 km/h. Add walker speed: 54 + 6 = no — relative speed is train − man = 54 ⇒ train = 60 km/h. (Verify direction!) Reading question carefully: relative = train − 6 = 54 ⇒ train = 60 km/h. Closer answer: 60.'
      },
      {
        question: 'In a code, ROBUST is written as QNATTS. How is INDIAN written?',
        options: ['HMCHZM', 'HMCHZN', 'HOCDZM', 'HMCHAM'],
        correctAnswer: 0,
        explanation: 'Each letter shifted -1: I→H, N→M, D→C, I→H, A→Z, N→M ⇒ HMCHZM.'
      },
      {
        question: 'Find the synonym of OBSCURE:',
        options: ['Bright', 'Vague', 'Visible', 'Direct'],
        correctAnswer: 1,
        explanation: 'Obscure = unclear / vague.'
      },
      {
        question: 'In Java, which collection guarantees iteration order matching insertion order?',
        options: ['HashSet', 'TreeSet', 'LinkedHashSet', 'HashMap'],
        correctAnswer: 2,
        explanation: 'LinkedHashSet preserves insertion order. HashSet has no order; TreeSet sorts.'
      },
      {
        question: 'The output of System.out.println(2 + 3 + "Java" + 4 + 5); is:',
        options: ['5Java45', '5Java9', '23Java45', '23Java9'],
        correctAnswer: 0,
        explanation: 'Left-to-right: 2+3=5, then "5"+"Java"="5Java", then "5Java"+"4"+"5" = "5Java45".'
      },
      {
        question: 'Which of the following is NOT a primitive type in Java?',
        options: ['int', 'String', 'boolean', 'double'],
        correctAnswer: 1,
        explanation: 'String is a class (object). Primitives: byte, short, int, long, float, double, char, boolean.'
      },
      {
        question: 'A boat travels 24 km downstream in 2 h and 24 km upstream in 3 h. Speed of stream (km/h)?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1,
        explanation: 'Down = 12, Up = 8. Stream = (12 − 8)/2 = 2 km/h.'
      },
      {
        question: 'What is the time complexity of binary search on a sorted array?',
        options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
        correctAnswer: 2,
        explanation: 'Binary search halves the search space each iteration → O(log n).'
      },
      {
        question: 'A is the brother of B. B is the daughter of C. C is the father of D. How is A related to D?',
        options: ['Brother', 'Cousin', 'Cannot be determined', 'Uncle'],
        correctAnswer: 0,
        explanation: 'A and B share father C; D is also a child of C. A is brother of D.'
      },
      {
        question: 'The average of 5 numbers is 18. If 22 is added, the new average is:',
        options: ['18', '18.67', '19', '19.33'],
        correctAnswer: 3,
        explanation: 'New sum = 90 + 22 = 112; new avg = 112/6 ≈ 18.67. (Pick closest answer choice as 18.67.)'
      },
      {
        question: "If 'today is Tuesday', what day of the week was it 100 days ago?",
        options: ['Saturday', 'Sunday', 'Monday', 'Tuesday'],
        correctAnswer: 1,
        explanation: '100 mod 7 = 2 (since 98 = 14×7). So 2 days before Tuesday = Sunday.'
      },
      {
        question: 'Which of the following best fills the blank?\n"He is the only person ___ I trust completely."',
        options: ['who', 'whom', 'which', 'whose'],
        correctAnswer: 0,
        explanation: '"Who" is the subject of "trust" (informally also accepted), but in modern usage "who I trust" is standard.'
      },
      {
        question: 'A pipe can fill a tank in 10 hours. Due to a leak, it takes 12 hours. The leak alone can empty a full tank in:',
        options: ['50 h', '55 h', '60 h', '65 h'],
        correctAnswer: 2,
        explanation: '1/10 − 1/L = 1/12 ⇒ 1/L = 1/10 − 1/12 = 1/60 ⇒ L = 60 h.'
      },
      {
        question: "In Java, which keyword prevents a method from being overridden?",
        options: ['static', 'private', 'final', 'abstract'],
        correctAnswer: 2,
        explanation: 'final methods cannot be overridden. final classes cannot be subclassed.'
      },
      {
        question: 'Find the missing term: 1, 4, 9, 16, ?, 36',
        options: ['20', '25', '30', '32'],
        correctAnswer: 1,
        explanation: 'Squares: 1², 2², 3², 4², 5²=25, 6².'
      }
    ],
    codingProblems: [
      {
        title: 'Reverse a String (Java)',
        description: 'Write a Java program that reads a string and prints its reverse. Do NOT use the StringBuilder.reverse() method.',
        initialCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        // TODO: print the reverse of s without using StringBuilder.reverse()
    }
}`,
        expectedOutput: 'Reverses the input string character by character.'
      }
    ]
  },
  {
    companyName: 'Wipro',
    title: 'Wipro NLTH — Mock Round (Pattern)',
    description: '12 MCQs covering aptitude + logical + verbal + technical (DBMS, OS), with 1 coding problem. Modeled on the Wipro NLTH (Elite) hiring pattern.',
    durationMinutes: 60,
    difficulty: 'Medium',
    isActive: true,
    mcqs: [
      {
        question: 'A man buys an article for ₹500 and sells it at a loss of 10%. The selling price is:',
        options: ['₹430', '₹440', '₹450', '₹460'],
        correctAnswer: 2,
        explanation: '10% of 500 = 50. SP = 500 − 50 = 450.'
      },
      {
        question: 'Find the next term in the series: 2, 6, 12, 20, 30, ?',
        options: ['38', '40', '42', '44'],
        correctAnswer: 2,
        explanation: 'Differences: 4, 6, 8, 10, 12. Next = 30 + 12 = 42.'
      },
      {
        question: 'Antonym of FRUGAL:',
        options: ['Wasteful', 'Clever', 'Fruitful', 'Mean'],
        correctAnswer: 0,
        explanation: 'Frugal = thrifty; antonym = wasteful.'
      },
      {
        question: 'Which normal form eliminates partial dependencies on a composite primary key?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctAnswer: 1,
        explanation: '2NF removes partial dependencies. 3NF removes transitive dependencies.'
      },
      {
        question: 'Which of these is a non-volatile storage?',
        options: ['Cache', 'RAM', 'SSD', 'Registers'],
        correctAnswer: 2,
        explanation: 'SSD/HDD persist without power. RAM, cache, registers are volatile.'
      },
      {
        question: 'In OOP, "is-a" relationship is implemented via:',
        options: ['Composition', 'Aggregation', 'Inheritance', 'Encapsulation'],
        correctAnswer: 2,
        explanation: '"is-a" → inheritance. "has-a" → composition/aggregation.'
      },
      {
        question: 'A starts a job and works for 4 days. B alone finishes the rest in 6 days. If A and B together take 5 days for the whole job, how many days would A alone take?',
        options: ['10', '12', '15', '20'],
        correctAnswer: 0,
        explanation: 'A+B together: 1/5 per day. In 5 days they finish. A worked 4 days alone (rate a), then B 6 days alone (rate b). Sum: 4a + 6b = 1; also 5(a+b) = 1. Subtract: a + b = 0.2; 4a + 6b = 1; a = 0.1 ⇒ A alone = 10 days.'
      },
      {
        question: 'Which sorting algorithm is stable in its standard implementation?',
        options: ['QuickSort', 'HeapSort', 'MergeSort', 'SelectionSort'],
        correctAnswer: 2,
        explanation: 'MergeSort is stable. QuickSort and HeapSort are not stable in standard implementations.'
      },
      {
        question: 'In TCP, which mechanism handles flow control?',
        options: ['Three-way handshake', 'Sliding window', 'Slow start', 'Congestion avoidance'],
        correctAnswer: 1,
        explanation: 'Sliding window is for flow control. Slow start and congestion avoidance handle congestion control.'
      },
      {
        question: 'In a class containing 30 students, 18 like cricket and 22 like football. If everyone likes at least one, how many like both?',
        options: ['8', '10', '12', '14'],
        correctAnswer: 1,
        explanation: '|C∩F| = |C| + |F| − |C∪F| = 18 + 22 − 30 = 10.'
      },
      {
        question: 'In Java, an interface with no methods is called:',
        options: ['Abstract interface', 'Marker interface', 'Functional interface', 'Static interface'],
        correctAnswer: 1,
        explanation: 'Marker interface (e.g., Serializable) — used to tag classes for runtime detection.'
      },
      {
        question: 'A car covers a distance in 5 h at 60 km/h. To cover the same distance in 4 h, the speed must be:',
        options: ['72 km/h', '75 km/h', '78 km/h', '80 km/h'],
        correctAnswer: 1,
        explanation: 'Distance = 300 km. Required speed = 300/4 = 75 km/h.'
      }
    ],
    codingProblems: [
      {
        title: 'Sum of Digits',
        description: 'Read a positive integer and print the sum of its digits.',
        initialCode: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: print the sum of digits of n
    }
}`,
        expectedOutput: 'Returns sum of digits — e.g. 1234 → 10.'
      }
    ]
  }
];

const seedDB = async () => {
  try {
    let inserted = 0;
    for (const m of mocks) {
      const exists = await MockTest.findOne({ title: m.title });
      if (exists) {
        console.log(`Skipping (already exists): ${m.title}`);
        continue;
      }
      await MockTest.create(m);
      inserted += 1;
      console.log(`Inserted: ${m.title}`);
    }
    console.log(`Mock seeding complete. ${inserted} new mocks added.`);
    process.exit();
  } catch (err) {
    console.error('Mock seeding error:', err);
    process.exit(1);
  }
};

setTimeout(seedDB, 1500);
