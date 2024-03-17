type Subject = {
	sessionName?: string;
	id: string;
	courseCode: string;
	courseName: string;
	section: string;
	chr: string;
	timestamps: WeekTime;
	venue: string;
	lecturer: string;
};

type WeekTime = {
	start: string;
	end: string;
	day: number;
};

type TimetableConfig = {
	startDay: number;
	endDay: number;
	startHour: number;
	endHour: number;
};

type Courses = {
	schedule: Subject[];
	sessionName: string;
	sessionQuery: string;
};

type Cgpa = {
	sessionName: string;
	gpaValue: string;
	cgpaValue: string;
};

type Result = {
	sessionName: string;
	sessionQuery: string;
	gpaValue: string;
	cgpaValue: string;
	status: string;
	remarks: string;
	result: {
		courseCode: string;
		courseName: string;
		courseGrade: string;
		courseCredit: string;
	}[];
};
