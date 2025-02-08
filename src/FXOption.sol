// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FXOption {
    function calculateOptionPrice(
        uint256 S, // Spot price
        uint256 K, // Strike price
        int256 r_d, // Domestic risk-free rate
        int256 r_f, // Foreign risk-free rate
        uint256 sigma, // Volatility
        uint256 T, // Time to maturity
        bool isCall // Call or put option
    ) external pure returns (uint256) {
        int256 T_int = int256(T);
        int256 sigma_int = int256(sigma);
        int256 sqrtT = int256(sqrt(T)); // Ensure sqrt(T) is int256

        int256 d1 = (ln(int256(S) * 1e18 / int256(K)) + (r_d - r_f + (sigma_int ** 2) / (2 * 1e18)) * T_int) 
                    / (sigma_int * sqrtT / 1e18);
        int256 d2 = d1 - (sigma_int * sqrtT / 1e18);

        // Convert values to int256 before multiplication
        int256 S_int = int256(S);
        int256 K_int = int256(K);
        int256 exp_rf = int256(exp(-r_f * T_int / 1e18)); // Convert exp() output to int256
        int256 exp_rd = int256(exp(-r_d * T_int / 1e18)); // Convert exp() output to int256
        int256 norm_d1 = int256(normCDF(d1)); // Convert normCDF() output to int256
        int256 norm_d2 = int256(normCDF(d2));
        int256 norm_neg_d1 = int256(normCDF(-d1));
        int256 norm_neg_d2 = int256(normCDF(-d2));

        uint256 price;
        if (isCall) {
            price = uint256(
                ((S_int * exp_rf / 1e18) * norm_d1 / 1e18) -
                ((K_int * exp_rd / 1e18) * norm_d2 / 1e18)
            );
        } else {
            price = uint256(
                ((K_int * exp_rd / 1e18) * norm_neg_d2 / 1e18) -
                ((S_int * exp_rf / 1e18) * norm_neg_d1 / 1e18)
            );
        }

        return price;
    }

    // Helper functions
    function ln(int256 x) internal pure returns (int256) {
        require(x > 0, "Log input must be positive");
        return int256((int256(log2(uint256(x))) * 1e18) / int256(log2(2718281828459045235))); // ln(x) = log2(x) / log2(e)
    }

    function log2(uint256 x) internal pure returns (uint256) {
        uint256 result = 0;
        while (x > 1) {
            x >>= 1;
            result++;
        }
        return result * 1e18;
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function exp(int256 x) internal pure returns (uint256) {
        uint256 result = 1e18;
        uint256 term = 1e18;
        for (uint256 i = 1; i <= 10; i++) {
            term = (term * uint256(x)) / (i * 1e18);
            result += term;
        }
        return result;
    }

    function normCDF(int256 x) internal pure returns (uint256) {
        if (x < 0) {
            return 1e18 - normCDF(-x);
        }
        return (1e18 + erf(x * 1e18 / int256(sqrt(2 * 1e18)))) / 2;
    }

    function erf(int256 x) internal pure returns (uint256) {
        uint256 t = 1e18 / (1e18 + (3275911 * uint256(x)) / 1e18);
        int256 a1 = 254829592;
        int256 a2 = -284496736;
        int256 a3 = 1421413741;
        int256 a4 = -1453152027;
        int256 a5 = 1061405429;
        uint256 tmp = t * (uint256(a1) + t * (uint256(a2) + t * (uint256(a3) + t * (uint256(a4) + t * uint256(a5)))));
        return 1e18 - (tmp * exp(-x * x / 2)) / 1e18;
    }
}
