import { Employees } from './employees';


export const EMPLOYEES: Employees[] = [
    { tabelnom: 1, surname: 'Петров', name: 'Петр', patronymic: 'Петрович', 
        days: [ 
            { value: 'От', colspan: 4}, 
            { value: 'Вых', colspan: 2},
            { value: '8', colspan: 2},  
            { value: 'К', colspan: 10}, 
            { value: '8', colspan: 5}, 
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 5}, 
            { value: 'Вых', colspan: 1} 
        ] },
    { tabelnom: 2, surname: 'Иванов', name: 'Иван', patronymic: 'Иванович', 
        days: [ 
            { value: '8', colspan: 4}, 
            { value: 'Вых', colspan: 2},
            { value: '8', colspan: 5},  
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 5}, 
            { value: 'Вых', colspan: 2}, 
            { value: 'К', colspan: 5}, 
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 4}
        ] },
    { tabelnom: 3, surname: 'Павлов', name: 'Павел', patronymic: 'Павлович', 
        days: [ 
            { value: '8', colspan: 4}, 
            { value: 'Вых', colspan: 2},
            { value: '8', colspan: 5},  
            { value: 'К', colspan: 7}, 
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 3}, 
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 1}, 
            { value: 'Вых', colspan: 1}, 
            { value: '8', colspan: 4}
        ] },
    { tabelnom: 4, surname: 'Александров', name: 'Александр', patronymic: 'Александрович', 
        days: [ 
            { value: 'К', colspan: 4}, 
            { value: 'Вых', colspan: 2},
            { value: 'К', colspan: 5},  
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 5}, 
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 1}, 
            { value: 'Вых', colspan: 1}, 
            { value: '8', colspan: 4},
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 3}
        ] },    
    { tabelnom: 5, surname: 'Егоров', name: 'Егор', patronymic: 'Егорович', 
        days: [ 
            { value: '8', colspan: 4}, 
            { value: 'Вых', colspan: 2}, 
            { value: 'К', colspan: 10}, 
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 5}, 
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 1}, 
            { value: 'Вых', colspan: 1}, 
            { value: '8', colspan: 4}
        ] },
    { tabelnom: 6, surname: 'Скворцов', name: 'Егор', patronymic: 'Егорович', 
        days: [ 
            { value: '8', colspan: 1}, 
            { value: 'К', colspan: 3}, 
            { value: '8', colspan: 5}, 
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 5}, 
            { value: 'Вых', colspan: 2}, 
            { value: '8', colspan: 5}, 
            { value: 'Вых', colspan: 2}, 
            { value: 'К', colspan: 2},
            { value: 'Вых', colspan: 1},  
            { value: '8', colspan: 3}
        ] }
];
