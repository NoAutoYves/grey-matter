// src/data/subjectContent.js
// Long-form content for each subject page.
// Rendered below the interactive content on /:subject pages.
// Keys match the URL slug used in App.jsx routing.
//
// Formatting:
//   **bold text**    → <strong>
//   *italic text*    → <em>
//   subsections[]    → renders as a sub-heading with paragraphs below it

export const subjectContent = {
  accounting: {
    sections: [
      {
        heading: "About Accounting",
        paragraphs: [
          "Accounting is **the language of business**. It is the systematic process of recording, classifying, summarising, and interpreting financial information so that owners, managers, investors, and the state can make informed decisions. It is one of the most practically useful subjects a learner can take in high school, because the skills it teaches - from understanding a **balance sheet** to reading a **cash flow statement** to calculating a ratio - apply directly to running a business, managing personal finances, and understanding how the economy works.",
        ],
      },
      {
        heading: "What you'll cover across Grades 10, 11 and 12",
        subsections: [
          {
            subheading: "Grade 10",
            paragraphs: [
              "Grade 10 lays the foundation for everything that follows. You start with the **accounting equation**: *Assets = Owner's Equity + Liabilities*, and learn why it must always balance. From there you are introduced to **source documents** such as receipts, invoices, and cheques, and you learn how each one gives rise to a journal entry. The **subsidiary journals** (Cash Receipts, Cash Payments, Debtors Journal, Creditors Journal, and General Journal) are covered in detail, followed by posting to the **General Ledger** and the preparation of a **Trial Balance**. You then learn to prepare the financial statements of a sole trader, namely the **Income Statement** and the **Balance Sheet**, along with year-end adjustments for depreciation, accruals, prepayments, and inventory. **VAT**, wages and salaries, and the basics of **internal control and business ethics** are also introduced. By the end of the year, you should be able to take a set of transactions and produce a complete set of financial records.",
            ],
          },
          {
            subheading: "Grade 11",
            paragraphs: [
              "Grade 11 shifts focus to more complex business forms. **Partnerships** are the major new topic: how they are formed, how the Capital and Current accounts of each partner work, how profits and losses are shared according to the partnership agreement, and how to prepare the financial statements of a partnership, including the **appropriation account**. **Non-profit organisations** such as clubs are covered next, where the focus is on the Receipts and Payments account, the Income and Expenditure account, and how these differ from the accounts of a business. You also cover **cost accounting** for a manufacturing business, learning how to prepare a Production Cost Statement and how to calculate the cost of raw materials, direct labour, and overheads. **Bank and creditors reconciliations**, fixed asset management including depreciation and asset disposal, and the two **inventory systems** (perpetual and periodic) round out the year.",
            ],
          },
          {
            subheading: "Grade 12",
            paragraphs: [
              "Grade 12 is the most demanding year and focuses heavily on **companies**. You learn about share capital, retained income, dividends, income tax, and how to prepare the financial statements of a company in line with the **Companies Act**. The **Cash Flow Statement** is a major topic, and you learn to reconcile the movement of cash with the changes in the Balance Sheet. **Analysis and interpretation** of financial statements uses ratios and other financial indicators to assess the profitability, liquidity, and solvency of a business, and this topic carries substantial marks in the final exam. You also cover **manufacturing accounts** in more depth, VAT calculations including VAT returns, **budgeting** including cash budgets and projected income statements, and **corporate governance** including the principles of the King Code. By the end of Grade 12, you should be able to read a full annual report and understand what it is telling you.",
            ],
          },
        ],
      },
      {
        heading: "How to prepare for the exams",
        paragraphs: [
          "Accounting rewards **practice far more than memorisation**. The most common mistake learners make is trying to memorise the format of a financial statement without understanding why it is laid out that way. If you understand the accounting equation and the logic of double-entry, you can work through unfamiliar questions with confidence.",
          "Work through as many **past papers** as you can. Certain structures appear every year: the Income Statement, the Balance Sheet, the Cash Flow Statement, and the analysis of financial statements. There are easy marks available for correctly applying the format before you even reach the harder interpretation questions. If you can nail the structure, you are halfway to a pass.",
        ],
      },
      {
        heading: "How Grey Matter helps",
        paragraphs: [
          "Every Accounting exercise on Grey Matter is a **10-question multiple-choice set** tied to a specific CAPS topic, whether that is *Correction of Errors* in Grade 10, *Partnerships* in Grade 11, or *Cash Flow Statements* in Grade 12. You get **instant feedback** on each answer, a full **per-question breakdown** showing where you went wrong, and the ability to **retake** any exercise as many times as you need.",
          "We currently have **145 Accounting exercises** across Grades 10, 11 and 12. Every question is written in the format and difficulty you will encounter in a school test or the final matric paper.",
        ],
      },
      {
        heading: "What to prioritise",
        paragraphs: [
          "If you are working towards the final exam, prioritise the **financial statements of companies**, the **cash flow statement**, and the **analysis of financial statements**. These three topics carry the most marks and appear every year. If you are in Grade 10 or Grade 11, focus on understanding the **accounting cycle** properly. Everything else builds on that foundation.",
        ],
      },
    ],
  },

  business: {
    sections: [
      {
        heading: "About Business Studies",
        paragraphs: [
          "Business Studies explores how organisations are created, managed, and sustained in a changing economic environment. It covers the full spectrum of business activity: how businesses are started, how they are structured, how they operate day to day, and how they respond to the **social, legal, technological, and economic forces** around them. It is one of the most relevant subjects you can take if you are interested in **entrepreneurship, management**, or simply understanding how the world of work functions.",
        ],
      },
      {
        heading: "What you'll cover across Grades 10, 11 and 12",
        subsections: [
          {
            subheading: "Grade 10",
            paragraphs: [
              "Grade 10 introduces the **four core areas** that structure the whole subject: *business environments*, *business operations*, *business ventures*, and *business roles*. In business environments, you learn about the **micro environment** (the business itself and its immediate resources), the **market environment** (customers, competitors, suppliers), and the **macro environment** (political, economic, social, technological, legal, and environmental forces). Business operations introduces the **eight business functions**: general management, administration, human resources, marketing, production, public relations, purchasing, and financial. Business ventures covers the different **forms of ownership**, from a sole proprietor through partnerships and close corporations to private and public companies, along with the advantages and disadvantages of each. Business roles is about you as a future business person, covering creative thinking, problem solving, self-management, and ethical behaviour.",
            ],
          },
          {
            subheading: "Grade 11",
            paragraphs: [
              "Grade 11 goes deeper into each of the four areas. The **macro environment** is studied in more detail, including the various **business sectors** (primary, secondary, and tertiary) and the relationship between them. Business operations expands each function: you learn how **production planning** works, how marketing uses the **marketing mix**, how financial record-keeping supports decision-making, and how administration holds everything together. Business ventures covers the **business plan** in detail, including the components of a good plan, how to do a **SWOT analysis**, and how to raise start-up capital. You also learn about **growth strategies** and how small businesses can scale. Business roles covers professionalism, ethics, **corporate social responsibility**, stress management, time management, and the importance of teamwork and effective communication in a business environment.",
            ],
          },
          {
            subheading: "Grade 12",
            paragraphs: [
              "Grade 12 brings everything together into a cohesive picture of how business operates in South Africa. Business environments covers the **legislative environment** in detail, including the various Acts that govern business conduct, as well as the economic, social, and technological environments. Business operations focuses on **human resources** (recruitment, selection, induction, training, and appraisal), **quality of performance** (TQM, quality control, and continuous improvement), and **occupational health and safety**. Business ventures covers **management and leadership theory**, including the difference between management and leadership, the various **leadership styles**, and how to apply them. **Investment opportunities** are covered in detail, including securities (shares, bonds), insurance, and the various investment options available to individuals and businesses. Business roles explores ethics, corporate citizenship, and the professional responsibilities of business leaders. You also study **labour legislation** including the Labour Relations Act, the Basic Conditions of Employment Act, the Employment Equity Act, and BBBEE.",
            ],
          },
        ],
      },
      {
        heading: "How to prepare for the exams",
        paragraphs: [
          "Business Studies rewards learners who can **think in case studies**. The final paper is almost entirely scenario based. You are given a business situation and asked to identify problems, apply theory, and recommend solutions. The most effective preparation is to work through as many past scenarios as you can and practise structuring your answers the way markers expect.",
          "Pay attention to the **command words** in each question: *discuss*, *explain*, *evaluate*, and *advise* all require different depths of response. Learn to spot which one is being asked and answer accordingly. Also make sure you know the specific **terminology**. A mark is often allocated purely for using the correct business term rather than a paraphrase.",
        ],
      },
      {
        heading: "How Grey Matter helps",
        paragraphs: [
          "Every Business Studies exercise on Grey Matter is a **10-question multiple-choice set** tied to a specific CAPS topic, from the basic forms of ownership in Grade 10 to labour legislation and investment options in Grade 12. You get **instant feedback**, a **per-question breakdown** showing exactly what you got wrong, and the option to **retake** any exercise until you are confident.",
          "We currently have **240 Business Studies exercises** across Grades 10, 11 and 12, our largest subject on the platform. Every question is written to reflect the style and difficulty of a real school assessment.",
        ],
      },
      {
        heading: "What to prioritise",
        paragraphs: [
          "If you are preparing for the final matric exam, focus on the **four business environments**, the **human resources function**, and the **legislation** that governs business in South Africa. These carry the most marks and are guaranteed to appear. If you are in Grade 10 or 11, spend time mastering the terminology and learning to structure answers around the scenario in front of you. This is the skill that separates a mark of 60% from 80%.",
        ],
      },
    ],
  },

  economics: {
    sections: [
      {
        heading: "About Economics",
        paragraphs: [
          "Economics is the study of how individuals, businesses, governments, and societies make choices about how to allocate **scarce resources**. It is about the trade-offs we all face: what to produce, what to consume, what to save, what to invest. Understanding economics helps you make sense of the news, evaluate government policy, and think clearly about the world of work you are about to enter.",
        ],
      },
      {
        heading: "What you'll cover across Grades 10, 11 and 12",
        subsections: [
          {
            subheading: "Grade 10",
            paragraphs: [
              "Grade 10 introduces the foundational ideas that everything else rests on. You begin with **the economic problem**: that resources are scarce but human wants are unlimited, and that every society must therefore make choices about what to produce, how to produce it, and for whom. From there you learn about the **circular flow of income and spending**, which describes how money moves between households, firms, government, and the foreign sector, and why these four participants are interdependent. The **factors of production** (land, labour, capital, and entrepreneurship) are covered, along with the rewards each one earns (rent, wages, interest, and profit). You are then introduced to the three basic **economic systems** (market, centrally planned, and mixed), and you learn why almost every modern economy is mixed to some degree. By the end of Grade 10, you should be able to explain how a simple economy works and why no economy can satisfy all the wants of all its people.",
            ],
          },
          {
            subheading: "Grade 11",
            paragraphs: [
              "Grade 11 splits the subject into its two main branches. **Microeconomics** looks at individual markets and the behaviour of consumers and firms. You learn how **demand and supply** interact to determine prices, what **elasticity** means and why it matters, and how the four **market structures** (perfect competition, monopolistic competition, oligopoly, and monopoly) differ from each other. **Cost and revenue analysis** is covered, including the difference between fixed and variable costs, and how firms decide what price to charge and how much to produce. **Macroeconomics** looks at the economy as a whole. You learn how economic performance is measured using **GDP and GNP**, what the **business cycle** is and why economies expand and contract, and the difference between **economic growth** and **economic development**. By the end of Grade 11, you should be able to read an economic news article and understand what it is describing.",
            ],
          },
          {
            subheading: "Grade 12",
            paragraphs: [
              "Grade 12 focuses on the South African economy in a global context. **Inflation** is studied in detail: what causes it, how it is measured, and why the South African Reserve Bank targets a specific range. **Unemployment** is covered along with its various types and the policies that can reduce it. The **monetary policy framework** and the **fiscal policy framework** are explained, including how the Reserve Bank uses interest rates and how the government uses taxation and spending. **International trade** is covered, including the balance of payments, exchange rates, and why countries trade with each other. **Economic integration** is discussed with reference to the African Union and SADC. **The role of the state** in the economy is studied, including public sector failure and the various instruments government uses to influence the economy. By the end of Grade 12, you should be able to analyse almost any economic policy and understand its likely effects.",
            ],
          },
        ],
      },
      {
        heading: "How to prepare for the exams",
        paragraphs: [
          "Economics rewards learners who can **apply theory to current events**. Read the news. Pay attention to interest rate decisions, inflation announcements, and unemployment figures. The exam often asks you to analyse a scenario using the theory you have learnt.",
          "The most common mistake is **memorising definitions without learning to apply them**. The exam rarely asks what is inflation. It asks you to explain the impact of inflation on a specific group, or to evaluate a policy response. Practise application, not just recall.",
        ],
      },
      {
        heading: "How Grey Matter helps",
        paragraphs: [
          "We have **205+ Economics exercises** across Grades 10, 11 and 12. Topics include supply and demand, market structures, economic indicators, fiscal and monetary policy, and international trade. Every exercise is a **10-question set** with instant feedback and a full per-question breakdown.",
        ],
      },
      {
        heading: "What to prioritise",
        paragraphs: [
          "For Grade 12, focus on **inflation**, **unemployment**, **fiscal and monetary policy**, and **international trade**. These are the highest-mark topics. For Grade 10 and 11, master the **circular flow** and **market structures** before moving on, as these concepts underpin everything in later grades.",
        ],
      },
    ],
  },

  geography: {
    sections: [
      {
        heading: "About Geography",
        paragraphs: [
          "Geography is the study of the Earth's surface, its physical features, its climate, its people, and the interactions between them. It bridges the natural sciences (**physical geography**) and the social sciences (**human geography**). Studying geography gives you a **spatial understanding** of the world: where things are, why they are there, and how they change over time.",
        ],
      },
      {
        heading: "What you'll cover across Grades 10, 11 and 12",
        subsections: [
          {
            subheading: "Grade 10",
            paragraphs: [
              "Grade 10 introduces the major branches of the subject. **Climatology** covers the composition and structure of the atmosphere, how the atmosphere is heated, and the factors that influence weather and climate. You learn about different **climate regions** around the world and the weather systems that produce them. **Geomorphology** looks at the structure of the Earth, **plate tectonics**, and how the movement of plates creates mountains, volcanoes, and earthquakes. Landforms and the processes that shape them are introduced here. **Mapwork** is a practical skill you will use throughout the three years: you learn how to read a topographic map, understand scale, use **contours** to visualise elevation, calculate distances and gradients, and interpret **GIS** data. **Population geography** covers how populations are distributed, why they grow, and what drives migration. **Water resources** rounds out the year, looking at how water is distributed and managed.",
            ],
          },
          {
            subheading: "Grade 11",
            paragraphs: [
              "Grade 11 goes into much more depth on each topic. Climatology covers **mid-latitude cyclones** and **tropical cyclones** in detail: how they form, how they move, and what weather they bring. **Global air circulation** is explained, including the tri-cellular model and the role of the oceans in regulating climate. Geomorphology covers **slopes and mass movements**, **river systems and drainage basins**, and the processes that shape each one. **Development geography** is a new topic and looks at how development is measured, why some countries are more developed than others, and what can be done to reduce inequality. **Resources and sustainability** looks at how natural resources are used and how they can be managed responsibly. **Topographic map interpretation** moves to a more advanced level, including cross-sections and gradient calculations.",
            ],
          },
          {
            subheading: "Grade 12",
            paragraphs: [
              "Grade 12 examines Africa and the wider world through a geographical lens. Climatology covers **Africa's climate** in detail, including the role of **El Niño and La Niña** in causing droughts and floods, and the broader topic of **climate change** and its effects on the continent. Geomorphology covers **fluvial processes** (the work of rivers) and **structural landforms** (features created by the underlying rock structure). **Settlement geography** is a major new topic: you learn about rural and urban settlement patterns, the process of **urbanisation**, and the internal structure of cities. **Economic geography** covers primary, secondary, and tertiary economic activities, and the location of industrial regions in South Africa and beyond. Mapwork reaches its most advanced level, including comprehensive interpretation of **topographic maps and orthophoto maps**, and a deeper look at **GIS applications** in real-world contexts.",
            ],
          },
        ],
      },
      {
        heading: "How to prepare for the exams",
        paragraphs: [
          "Geography has a large **mapwork component** that many learners neglect. Mapwork is **guaranteed marks**, and with regular practice it becomes easy. Learn how to interpret contour lines, calculate gradients, identify features, and read the variety of map types you will be tested on.",
          "The most common mistake is focusing on the physical geography content but **neglecting mapwork**, which can carry 25 to 30% of the paper. Also, learners often describe features without explaining the **processes that created them**. Geography questions usually ask *why* as well as *what*.",
        ],
      },
      {
        heading: "How Grey Matter helps",
        paragraphs: [
          "We have **75+ Geography exercises** across Grades 10, 11 and 12. Topics include map reading, climate systems, population studies, geomorphology, and settlement geography. Each exercise is **10 questions** with instant feedback and a per-question breakdown.",
        ],
      },
      {
        heading: "What to prioritise",
        paragraphs: [
          "For Grade 12, focus on **climate and weather**, **geomorphology**, and **settlement geography**. Mapwork should be practised **weekly**. For Grade 10 and 11, master the basics of climatology and map interpretation, as they carry through all three years.",
        ],
      },
    ],
  },

  "life-science": {
    sections: [
      {
        heading: "About Life Science",
        paragraphs: [
          "Life Science, sometimes called Biology, is the study of living organisms: their structure, function, growth, evolution, distribution, and interactions with their environment. It covers everything from the microscopic workings of a **cell** to the complex dynamics of an **ecosystem**. It is the foundation subject for careers in medicine, healthcare, research, environmental science, and biotechnology.",
        ],
      },
      {
        heading: "What you'll cover across Grades 10, 11 and 12",
        subsections: [
          {
            subheading: "Grade 10",
            paragraphs: [
              "Grade 10 begins at the smallest scale. The **chemistry of life** covers the molecules that make up living things, including carbohydrates, proteins, lipids, and nucleic acids, and the role water plays in biological systems. **Cells** are studied in detail: the structure of plant and animal cells, the function of each organelle, and the processes of **mitosis and meiosis**. From cells you move to **tissues**, learning how similar cells work together to form the four basic tissue types in plants and animals. The **human body systems** are introduced, including the skeletal, muscular, circulatory, and respiratory systems, along with how they interact to keep the body functioning. **Ecology** introduces the concept of biomes, food webs, energy flow, and the interaction between organisms and their environment. By the end of the year, you should be able to describe how life works at the cellular, tissue, and ecosystem levels.",
            ],
          },
          {
            subheading: "Grade 11",
            paragraphs: [
              "Grade 11 moves to **biodiversity** and the systems that keep organisms alive. You learn how living things are classified into the **five kingdoms** and how each kingdom is further subdivided. Microorganisms, plants, and animals are covered in detail, along with the features that distinguish each group. **Cellular respiration** and **photosynthesis** are studied at a deeper level: the chemical equations, the stages of each process, and why both are essential to life on Earth. **Animal nutrition** is covered in depth, including the human digestive system, the role of enzymes, and the different types of teeth and digestive adaptations. **Gas exchange**, **excretion**, and **transport systems** in mammals are studied alongside the human circulatory system. **Human population dynamics** is introduced as a bridge from biology into environmental studies, covering population growth, carrying capacity, and the factors that influence both.",
            ],
          },
          {
            subheading: "Grade 12",
            paragraphs: [
              "Grade 12 is the most conceptually demanding year. **DNA and protein synthesis** are covered in detail: the structure of DNA, how it replicates, and how it directs the synthesis of proteins. **Meiosis and genetics** build on this: you learn how traits are inherited, how to work through **monohybrid and dihybrid crosses** using Punnett squares, what **mutations** are, and how **genetic engineering** works. **Human reproduction** is covered in full, from gamete formation through fertilisation, pregnancy, and birth. The **nervous system** is studied, including the structure of a neuron, how nerve impulses travel, and how the brain and spinal cord coordinate responses. The **endocrine system** is introduced, with detailed coverage of each major gland and the hormones it produces. **Homeostasis** ties these systems together, showing how the body maintains stable internal conditions. **Evolution** is a major topic, covering natural selection, speciation, and human evolution. **Human impact on the environment** rounds out the year, looking at how our species affects ecosystems and what can be done about it.",
            ],
          },
        ],
      },
      {
        heading: "How to prepare for the exams",
        paragraphs: [
          "Life Science rewards **understanding over memorisation**. Genetics, in particular, requires you to practise drawing **Punnett squares** until the process is automatic. Evolution requires understanding the mechanisms, not just memorising Darwin's story.",
          "The most common mistake is memorising definitions but being unable to **apply them to new scenarios**. The exam often asks you to interpret a diagram or data set you have not seen before. Practise applying what you know.",
        ],
      },
      {
        heading: "How Grey Matter helps",
        paragraphs: [
          "We have **130+ Life Science exercises** across Grades 10, 11 and 12. Topics include cell biology, genetics, ecology, human anatomy and physiology, and evolution. Each exercise gives instant feedback and a per-question breakdown.",
        ],
      },
      {
        heading: "What to prioritise",
        paragraphs: [
          "For Grade 12, focus on **DNA and genetics**, **human reproduction**, **homeostasis**, and **evolution**. These are the highest-mark topics. For Grade 10 and 11, master **cells** and **basic ecology**, as everything else builds on them.",
        ],
      },
    ],
  },

  physics: {
    sections: [
      {
        heading: "About Physical Sciences",
        paragraphs: [
          "Physical Sciences combines **physics** and **chemistry**. It is the study of matter, energy, and the interactions between them. It develops the mathematical and analytical skills you will need for engineering, technology, and the physical sciences at tertiary level. It is one of the most challenging school subjects, but also one of the most rewarding.",
        ],
      },
      {
        heading: "What you'll cover across Grades 10, 11 and 12",
        subsections: [
          {
            subheading: "Grade 10",
            paragraphs: [
              "Grade 10 introduces both halves of the subject at once, so you start to see how physics and chemistry connect. In **mechanics**, you learn to describe motion in a straight line using displacement, velocity, and acceleration, how to apply the **equations of motion** to solve problems, and how to draw and interpret graphs of position, velocity, and acceleration against time. **Newton's laws of motion** are introduced here, giving you a framework for understanding why objects move the way they do. **Waves, sound, and light** cover what a wave actually is, how it transfers energy, the difference between transverse and longitudinal waves, and how light reflects, refracts, and disperses. The **electromagnetic spectrum** is introduced as a way of organising all types of radiation by wavelength and frequency. **Electricity and magnetism** start with static electricity, the behaviour of charges, and simple circuits, where you learn to use Ohm's law and to calculate current, voltage, and resistance in series and parallel circuits. The chemistry half of Grade 10 covers **matter and materials**, including the kinetic molecular theory, states of matter, and the difference between mixtures and pure substances. You learn how the **periodic table** is organised and why elements in the same group behave similarly, how atoms **bond** to form ionic and covalent compounds, and you are introduced to **chemical reactions** alongside **stoichiometry**, which is the quantitative side of chemistry that lets you calculate how much of a reactant is needed or how much product will form.",
            ],
          },
          {
            subheading: "Grade 11",
            paragraphs: [
              "Grade 11 goes deeper into both halves, and the mathematics becomes more demanding. **Vectors** are introduced as a way of representing quantities that have both magnitude and direction, and Newton's laws are extended to two dimensions: you learn to resolve forces into components, analyse objects on inclined planes, and solve problems where multiple forces act on the same object at once. **Momentum and impulse** are introduced, giving you the tools to analyse collisions and explosions. **Work, energy, and power** are covered in detail, including the **work-energy theorem** and the **conservation of mechanical energy**, which lets you solve problems by comparing energy states rather than tracking every force throughout a motion. Waves shift focus to **geometrical optics**, where you learn how light behaves through lenses and off mirrors, how to construct ray diagrams, and how to use the lens and mirror equations to calculate image position and magnification. **Sound** is revisited at a higher level, including how sound is produced, how it travels, and how the **Doppler effect** changes the observed frequency of a moving source. **Electromagnetism** is the major new topic in electricity and magnetism: you learn how a current-carrying conductor produces a magnetic field, how a changing magnetic field can **induce a current**, and how these principles underpin electric motors, generators, and transformers. The chemistry half introduces **chemical equilibrium**, the dynamic balance between forward and reverse reactions, including **Le Chatelier's principle** and how concentration, temperature, and pressure shift the position of equilibrium. **Acids and bases** are covered in depth, including pH calculations, titration, and the difference between strong and weak acids. **Redox reactions** are introduced alongside **electrochemistry**, which looks at how chemical energy is converted into electrical energy in cells and how electrolysis works in reverse.",
            ],
          },
          {
            subheading: "Grade 12",
            paragraphs: [
              "Grade 12 consolidates everything you have learnt and pushes into the more abstract areas of both halves. In mechanics, Newton's laws are applied to more complex systems, momentum is revisited with an emphasis on **conservation in two dimensions**, and work, energy, and power are combined into a single analytical toolkit. **Gravitation** is introduced as a universal force, including Newton's law of universal gravitation and how it explains planetary motion, satellite orbits, and escape velocity. The **Doppler effect** is revisited in more depth, including its applications in medicine (ultrasound) and astronomy (redshift), and the **photoelectric effect** is introduced as one of the founding experiments of quantum mechanics, showing that light behaves as a particle as well as a wave. You learn about the **work function**, the **threshold frequency**, and how to calculate the kinetic energy of ejected electrons. **Electric circuits** return with a more analytical approach, including complex circuits solved using **Kirchhoff's laws**, and **electromagnetic induction** is revisited with a focus on **Faraday's law** and **Lenz's law**, giving you the tools to explain how generators, transformers, and induction cookers actually work. The chemistry half is the most conceptually demanding of the three years. **Chemical equilibrium** and **acids and bases** are revisited at a higher level with more complex calculations. **Electrochemistry** is covered in full, including galvanic cells, electrolytic cells, and standard electrode potentials. **Organic chemistry** is a major new topic: the structure, naming, and reactions of hydrocarbons, alcohols, carboxylic acids, and other functional groups. **Reaction rates** are introduced, including collision theory, catalysts, and the factors that affect how fast a reaction proceeds.",
            ],
          },
        ],
      },
      {
        heading: "How to prepare for the exams",
        paragraphs: [
          "Physical Sciences is the most **formula-driven** subject on the school curriculum. You need to know the formulas, but more importantly, you need to be able to **identify which formula to apply** to a given problem. Practise problems until pattern recognition becomes second nature.",
          "The most common mistake is **neglecting the chemistry half** of the paper. Physical Sciences is roughly 50% physics and 50% chemistry, and both are weighted equally. If you only study one, you are capping your mark at 50%.",
        ],
      },
      {
        heading: "How Grey Matter helps",
        paragraphs: [
          "We have **235+ Physical Sciences exercises** across Grades 10, 11 and 12. Topics include mechanics, energy, wave theory, electricity, chemical equilibrium, and organic chemistry. Every exercise has **10 questions** with instant feedback, and complex physics problems use **proper mathematical notation** so formulas display the way they would in your textbook.",
        ],
      },
      {
        heading: "What to prioritise",
        paragraphs: [
          "For Grade 12, focus on **mechanics**, **electric circuits**, **organic chemistry**, and **chemical equilibrium**. These are the highest-mark topics. For Grade 10 and 11, master **motion and Newton's laws** first, as they underpin nearly everything else.",
        ],
      },
    ],
  },

  "maths-lit": {
    sections: [
      {
        heading: "About Mathematical Literacy",
        paragraphs: [
          "Mathematical Literacy is the **practical application of mathematics** to real-world problems. It is designed for learners who want to develop mathematical skills they will actually use in daily life, in work, and in further study. It covers **financial maths**, **data handling**, **measurement**, and **mathematical reasoning**, all applied to scenarios you might encounter in a job, in a shop, in a bank, or in managing your own household.",
        ],
      },
      {
        heading: "What you'll cover across Grades 10, 11 and 12",
        subsections: [
          {
            subheading: "Grade 10",
            paragraphs: [
              "Grade 10 builds the foundation for practical mathematical thinking. **Numbers and operations** covers working confidently with percentages, ratios, rates, and proportions, along with rounding and estimation, which are essential when working with real numbers in real contexts. **Financial maths** introduces personal finance: how to draw up a **budget**, how **interest** works on savings and loans, and how to calculate the cost of borrowing. **Measurement** covers perimeter, area, volume, and scale, with plenty of practical applications such as calculating how much paint is needed for a room or how much floor space a piece of furniture will take up. **Maps and plans** introduce you to reading and interpreting scale drawings, street maps, and simple floor plans. **Data handling** covers how data is collected, organised, and displayed in tables, bar graphs, histograms, and pie charts, along with how to read and interpret each type. **Probability** introduces the basic language of chance, including how to express probabilities as fractions, decimals, and percentages.",
            ],
          },
          {
            subheading: "Grade 11",
            paragraphs: [
              "Grade 11 goes deeper into each of these areas. Financial maths expands into **simple and compound interest**, **hire purchase** agreements, inflation, and **exchange rates**. You learn to calculate the real cost of a loan over its lifetime and to compare different financial products. Measurement moves to more complex shapes, including **surface area and volume** of prisms, cylinders, and other three-dimensional objects, along with how to work with combinations of shapes. Data handling covers **measures of central tendency** (mean, median, mode) and **measures of spread** (range, quartiles, interquartile range), along with how to represent data using **box-and-whisker plots** and **ogives**. Probability covers the **rules of probability**, including mutually exclusive and independent events, and how to use **Venn diagrams** and **tree diagrams** to solve problems. **Scale drawings and models** are studied in more detail, including how to work with two-dimensional representations of three-dimensional objects.",
            ],
          },
          {
            subheading: "Grade 12",
            paragraphs: [
              "Grade 12 focuses on the practical applications you will need after school. Financial maths is expanded significantly: you learn about **inflation** and how it erodes purchasing power, **compound interest** calculations including different compounding periods, how to calculate **loan repayments** using the future value and present value formulas, and how to compare investment options. You also cover **taxation**, including income tax brackets, rebates, and how to calculate take-home pay. Measurement covers complex calculations involving **area, surface area, volume, and scale**, applied to real-world problems such as designing a garden or estimating building materials. Data handling covers **statistical summaries and interpretation**, including how to critically evaluate statistics presented in the media and how to avoid being misled by poorly presented data. Probability covers **compound events** and **mutually exclusive events** at a more advanced level. **Maps and plans** covers interpreting and drawing floor plans, elevation plans, and simple scale drawings, with a focus on the kinds of plans you will encounter in everyday life and in many entry-level jobs.",
            ],
          },
        ],
      },
      {
        heading: "How to prepare for the exams",
        paragraphs: [
          "Mathematical Literacy is less about memorising formulas and more about being **comfortable with numbers and applying them to scenarios**. Practise word problems. Read the questions carefully. The biggest challenge for most learners is **interpreting what the question is asking**, not doing the arithmetic.",
          "The most common mistake is **rushing through calculations** without checking units or thinking about whether the answer makes sense. A question asking for the cost of a family grocery bill cannot have an answer of R12,500,000. **Sanity-check your answers**.",
        ],
      },
      {
        heading: "How Grey Matter helps",
        paragraphs: [
          "We have **150+ Mathematical Literacy exercises** across Grades 10, 11 and 12. Topics include financial maths, data analysis, measurement, and probability. Every exercise is a **10-question set** with instant feedback and full breakdowns.",
        ],
      },
      {
        heading: "What to prioritise",
        paragraphs: [
          "For Grade 12, focus on **financial maths** (it carries the most marks), **measurement**, and **data handling**. For Grade 10 and 11, build confidence with the basics: percentages, ratios, and reading tables and graphs. Everything else builds on these.",
        ],
      },
    ],
  },

  mathematics: {
    sections: [
      {
        heading: "About Mathematics",
        paragraphs: [
          "Mathematics is the language of **pattern, structure, and logical reasoning**. It underpins science, engineering, technology, and finance. It develops the ability to think abstractly, to reason rigorously, and to solve problems systematically. It is one of the most challenging subjects on the school curriculum, but it opens doors to the widest range of tertiary study and career options.",
        ],
      },
      {
        heading: "What you'll cover across Grades 10, 11 and 12",
        subsections: [
          {
            subheading: "Grade 10",
            paragraphs: [
              "Grade 10 sets the foundation for everything that follows. **Algebra** is the largest topic: you learn to work confidently with exponents, simplify algebraic expressions, solve linear and quadratic equations, work with inequalities, and understand functions and their graphs. **Euclidean geometry** revisits the geometry you learnt in earlier grades at a more rigorous level, covering parallel lines, triangles, and quadrilaterals, with an emphasis on **proof and logical reasoning**. **Analytical geometry** introduces the coordinate plane: how to find the distance between two points, the midpoint of a line segment, and the gradient of a line. **Trigonometry** introduces the trigonometric ratios (sine, cosine, and tangent), special angles, and how to solve right-angled triangles. **Measurement** covers surface area and volume of three-dimensional objects. **Finance and growth** introduces simple and compound interest. **Statistics and probability** cover how to summarise data and calculate basic probabilities. **Number patterns** introduces linear and quadratic sequences, which prepare you for the more complex sequences in Grade 12.",
            ],
          },
          {
            subheading: "Grade 11",
            paragraphs: [
              "Grade 11 expands and deepens each topic. Algebra now includes **exponents and surds** (irrational roots), quadratic equations solved by various methods, and quadratic inequalities. **Functions** are studied in depth, with detailed work on the **parabola**, the **hyperbola**, and the **exponential function**, including how to sketch each one and how transformations affect the graph. Analytical geometry covers the **equation of a line** and the **equation of a circle**. Euclidean geometry is dominated by **circle theorems**, which are among the most challenging topics in the curriculum. Trigonometry introduces **identities**, **reduction formulas**, and **general solutions** to trigonometric equations, moving beyond right-angled triangles to the unit circle. Measurement covers complex three-dimensional shapes. Finance, growth, and decay covers more advanced financial calculations. Statistics and probability continue from Grade 10 at a higher level. **Linear programming** is a new topic, where you learn to solve optimisation problems using graphs and feasible regions, with applications in business and logistics.",
            ],
          },
          {
            subheading: "Grade 12",
            paragraphs: [
              "Grade 12 is the most demanding year and brings together everything you have learnt. Algebra consolidates equations and inequalities, including the **nature of roots**. **Number patterns** expands into arithmetic and geometric **sequences and series**, including sum formulas and **sigma notation**. **Functions and inverses** cover the concept of an inverse function, the log function as the inverse of the exponential, and how to work with composite functions. **Calculus** is the largest new topic: you learn about **limits**, how to find the **derivative** of a function from first principles and using the rules of differentiation, and how to use calculus to find maximum and minimum values, solve rate-of-change problems, and sketch cubic graphs. Analytical geometry covers gradients, equations, and tangent lines to circles. Euclidean geometry continues with more complex proofs. **Trigonometry** is covered in two parts: the first covers identities, equations, and compound angle formulas, and the second covers the **sine, cosine, and area rules**, and the **trigonometric functions** (sin, cos, and tan graphs with their amplitude, period, and shifts). Finance, growth, and decay covers more advanced calculations including present and future value. **Statistics and probability** cover more sophisticated techniques including the normal distribution and the counting principle. Measurement completes the year with complex three-dimensional calculations.",
            ],
          },
        ],
      },
      {
        heading: "How to prepare for the exams",
        paragraphs: [
          "Mathematics is **not a subject you can cram**. It rewards consistent daily practice over months. The single most effective thing you can do is work through **past papers**, marking your own answers honestly and going back to the topics you got wrong. Focus on understanding the **reasoning behind each solution**, not just memorising the steps.",
          "The most common mistake is **skipping the theory and jumping straight to practice**, then getting stuck on unfamiliar questions because the underlying principles are not solid. Spend time on the theory, then apply it to as many problems as possible.",
        ],
      },
      {
        heading: "How Grey Matter helps",
        paragraphs: [
          "We have **185+ Mathematics exercises** across Grades 10, 11 and 12. Topics include algebra, calculus, statistics, trigonometry, geometry, and functions. All mathematics notation is **rendered properly**, so formulas display as they would in your textbook. Every exercise has instant feedback with a per-question breakdown.",
        ],
      },
      {
        heading: "What to prioritise",
        paragraphs: [
          "For Grade 12, focus on **calculus**, **functions**, **sequences and series**, and **trigonometry**. These carry the most marks. For Grade 10 and 11, master **algebra** first, as everything else depends on it.",
        ],
      },
    ],
  },
};

// Alias: 'maths' routes to 'mathematics'
subjectContent["maths"] = subjectContent["mathematics"];

// Normalise a URL slug to the correct key in subjectContent.
// Handles the aliases that might appear from the URL.
export function getSubjectContentKey(slug) {
  if (!slug) return null;
  const lower = slug.toLowerCase();
  const map = {
    "life-science": "life-science",
    "biology": "life-science",
    "maths-lit": "maths-lit",
    "mathematical-literacy": "maths-lit",
    "maths": "mathematics",
  };
  return map[lower] || lower;
}