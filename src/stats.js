
export function calculateQuartiles(data) {
    const count = data.length;
    const array = data.concat().sort();

    let median = 0;
    let lowerQuartile = 0;
    let upperQuartile = 0;
    let lowerQuartileIndex1 = 0;
    let lowerQuartileIndex2 = 0;

    if (count === 0) {
        return [0];
    }

    const uniqueValues = new Set(array);
    const max = Math.max(...uniqueValues);

    if (uniqueValues.size >= 4) {
        if (count % 2 === 0) {
            median = (array[count/2 - 1] + array[count/2]) / 2;
            if ((count / 2) % 2 === 0) {
                lowerQuartileIndex1 = count / 4;
                lowerQuartileIndex2 = lowerQuartileIndex1 - 1;

                lowerQuartile = (array[lowerQuartileIndex1] + array[lowerQuartileIndex2]) / 2;
                upperQuartile = (array[count - 1 - lowerQuartileIndex1] + array[count - 1 - lowerQuartileIndex2]) / 2;
            } else {
                lowerQuartileIndex1 = ((count / 2) - 1) / 2;

                lowerQuartile = array[lowerQuartileIndex1];
                upperQuartile = array[count - 1 - lowerQuartileIndex1];
            }
        } else {
            median = array[((count + 1) / 2) - 1];
            if (((count - 1) / 2) % 2 === 0) {
                lowerQuartileIndex1 = ((count - 1) / 2) / 2;
                lowerQuartileIndex2 = lowerQuartileIndex1 - 1;

                lowerQuartile = (array[lowerQuartileIndex1] + array[lowerQuartileIndex2]) / 2;
                upperQuartile = (array[count - 1 - lowerQuartileIndex1] + array[count - 1 - lowerQuartileIndex2]) / 2;
            } else {
                lowerQuartileIndex1 = (((count - 1) / 2) - 1) / 2;
                lowerQuartile = array[lowerQuartileIndex1];
                upperQuartile = array[count - 1 - lowerQuartileIndex1];
            }
        }
    } else {
        const values = [0, 1];
        if (max > 1) {
            values.push(max);
        }
        return values;
    }

    console.log(`Lower: ${lowerQuartile}, Median: ${median}, Upper: ${upperQuartile}, Max: ${max}`);
    return new Array(...new Set([0, lowerQuartile, median, upperQuartile, max])).sort((a, b) => a - b);
}
