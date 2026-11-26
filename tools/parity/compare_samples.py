import json,sys
o=json.load(open('sample_original.json'))['res']; r=json.load(open('sample_replica.json'))['res']
TOL={'tx':4,'ty':4,'rot':0.4,'sc':0.02,'op':0.04,'w':4,'h':4}
tot=bad=0; rows=[]
for pos in o:
    for k,ov in o[pos].items():
        rv=r[pos].get(k)
        if ov is None or rv is None:
            if ov!=rv: rows.append((pos,k,'missing')); 
            continue
        for f,t in TOL.items():
            if f in('w','h') and k not in('showreal','showVideo','gradLTop','gradRTop','gradLBot','gradRBot'): continue
            tot+=1
            if abs(ov[f]-rv[f])>t: bad+=1; rows.append((pos,k,f,ov[f],rv[f]))
print(f"compared {tot} numbers, {tot-bad} within tolerance ({100*(tot-bad)/tot:.1f}%), {bad} differ")
for row in rows:
    print('  ',row if len(row)==3 else f"{row[0]:>10} {row[1]:<12} {row[2]:<3} orig={row[3]:<8} replica={row[4]}")
