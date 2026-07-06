import {describe,expect,it} from 'vitest'; import {adjacentTo,haversineKm} from './geo'; import {localities} from './data';
describe('geo utilities',()=>{it('returns zero for same coordinates',()=>expect(haversineKm(12,77,12,77)).toBe(0));it('excludes selected locality',()=>{const selected=localities[0];expect(adjacentTo(selected,localities).some(x=>x.id===selected.id)).toBe(false)});});
