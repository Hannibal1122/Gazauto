import { Employees } from './employees';


export const EMPLOYEES: Employees[] = [
    { tabelnom: 1, surname: 'Петров', name: 'Петр', patronymic: 'Петрович', 
        days: [ 
            { value: 'От', colspan: 4}, 
            { value: 'Вых', colspan: 1},
            { value: 'Вых', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: 'К', colspan: 1}, 
            { value: 'К', colspan: 1}, 
            { value: 'К', colspan: 1}, 
            { value: 'К', colspan: 1}, 
            { value: 'К', colspan: 1}, 
            { value: 'К', colspan: 1}, 
            { value: 'К', colspan: 1}, 
            { value: 'К', colspan: 1}, 
            { value: 'Вых', colspan: 1}, 
            { value: 'Вых', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: 'Вых', colspan: 1}, 
            { value: 'Вых', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: 'Вых', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: '8', colspan: 1}, 
            { value: '8', colspan: 1} 
        ] },
    /*{ tabelnom: 2, surname: 'Иванов', name: 'Иван', patronymic: 'Иванович', 
        days: [ { color: 'gray', value: 'Вых'}, { color: 'green', value: '8'}, { color: 'red', value: 'К'}, { color: 'gray', value: 'Вых'}, { color: 'green', value: '8'}, { color: 'red', value: 'К'}, { color: 'gray', value: 'Вых'}, { color: 'green', value: '8'}, { color: 'red', value: 'К'}, { color: 'gray', value: 'Вых'}, { color: 'green', value: '8'}, { color: 'red', value: 'К'}, { color: 'gray', value: 'Вых'}, { color: 'green', value: '8'}, { color: 'red', value: 'К'}, { color: 'gray', value: 'Вых'}, { color: 'green', value: '8'}, { color: 'red', value: 'К'}, { color: 'gray', value: 'Вых'}, { color: 'green', value: '8'}, { color: 'red', value: 'К'}, { color: 'gray', value: 'Вых'}, { color: 'green', value: '8'}, { color: 'red', value: 'К'}, { color: 'gray', value: 'Вых'}, { color: 'green', value: '8'}, { color: 'red', value: 'К'}, { color: 'gray', value: 'Вых'}, { color: 'green', value: '8'}, { color: 'red', value: 'К'}, { color: 'red', value: 'К'} ] },
    { tabelnom: 3, surname: 'Павлов', name: 'Павел', patronymic: 'Павлович', 
        days: [ { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'} ] },
    { tabelnom: 4, surname: 'Александров', name: 'Александр', patronymic: 'Александрович', 
        days: [ { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'red', value: 'К'} ] },
    { tabelnom: 5, surname: 'Егоров', name: 'Егор', patronymic: 'Егорович', 
        days: [ { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'green', value: '8'}, { color: 'gray', value: 'Вых'}, { color: 'red', value: 'К'}, { color: 'red', value: 'К'} ] }
*/];


